import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import supabase from '../supabaseClient';
import notFound from '../assets/notfound.jpg';
import { UserAuth } from '../context/AuthContext';

const WeeklyChallenge = () => {
  const { session } = UserAuth();
  const [challenge, setChallenge] = useState(null);
  const [challengeEntries, setChallengeEntries] = useState([]);
  const [challengeLoading, setChallengeLoading] = useState(true);
  const [challengeVotes, setChallengeVotes] = useState({});
  const [challengeCoverImages, setChallengeCoverImages] = useState({});
  const [challengeUserVote, setChallengeUserVote] = useState(null);
  const [garageVehicles, setGarageVehicles] = useState([]);
  const [garageLoading, setGarageLoading] = useState(false);
  const [garageModalOpen, setGarageModalOpen] = useState(false);
  const [selectedGarageIds, setSelectedGarageIds] = useState([]);
  const [submittingEntries, setSubmittingEntries] = useState(false);

  const loadChallenge = async () => {
    if (!session?.user?.id) return;
    setChallengeLoading(true);

    const { data: challengeData, error: challengeError } = await supabase
      .from('challenges')
      .select('id, title, description, starts_at, ends_at')
      .eq('is_active', true)
      .order('starts_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (challengeError || !challengeData) {
      if (challengeError) {
        console.error('Error fetching challenge:', challengeError);
      }
      setChallenge(null);
      setChallengeEntries([]);
      setChallengeVotes({});
      setChallengeCoverImages({});
      setChallengeUserVote(null);
      setChallengeLoading(false);
      return;
    }

    setChallenge(challengeData);

    const { data: entriesData, error: entriesError } = await supabase
      .from('challenge_entries')
      .select('id, car_id, user_id, created_at, cars ( id, make, model, year )')
      .eq('challenge_id', challengeData.id);

    if (entriesError) {
      console.error('Error fetching challenge entries:', entriesError);
      setChallengeEntries([]);
      setChallengeVotes({});
      setChallengeCoverImages({});
      setChallengeUserVote(null);
      setChallengeLoading(false);
      return;
    }

    const entries = entriesData || [];
    setChallengeEntries(entries);

    const carIds = entries.map((entry) => entry.car_id).filter(Boolean);
    if (carIds.length > 0) {
      const { data: images, error: imagesError } = await supabase
        .from('car_images')
        .select('car_id, image_url')
        .eq('is_cover', true)
        .in('car_id', carIds);

      if (imagesError) {
        console.error('Error fetching challenge cover images:', imagesError);
        setChallengeCoverImages({});
      } else {
        const imageMap = {};
        (images || []).forEach((img) => {
          imageMap[img.car_id] = img.image_url;
        });
        setChallengeCoverImages(imageMap);
      }
    } else {
      setChallengeCoverImages({});
    }

    const entryIds = entries.map((entry) => entry.id).filter(Boolean);
    if (entryIds.length > 0) {
      const { data: votesData, error: votesError } = await supabase
        .from('challenge_votes')
        .select('entry_id, voter_id')
        .eq('challenge_id', challengeData.id)
        .in('entry_id', entryIds);

      if (votesError) {
        console.error('Error fetching challenge votes:', votesError);
        setChallengeVotes({});
        setChallengeUserVote(null);
      } else {
        const counts = {};
        let userVote = null;
        (votesData || []).forEach((vote) => {
          counts[vote.entry_id] = (counts[vote.entry_id] || 0) + 1;
          if (vote.voter_id === session.user.id) {
            userVote = vote.entry_id;
          }
        });
        setChallengeVotes(counts);
        setChallengeUserVote(userVote);
      }
    } else {
      setChallengeVotes({});
      setChallengeUserVote(null);
    }

    setChallengeLoading(false);
  };

  useEffect(() => {
    loadChallenge();
  }, [session]);

  const handleVote = async (entryId) => {
    if (!session?.user?.id || !challenge) return;
    if (challengeUserVote === entryId) return;

    const previousVoteId = challengeUserVote;
    const votePayload = {
      challenge_id: challenge.id,
      entry_id: entryId,
      voter_id: session.user.id,
    };

    const { error: voteError } = await supabase
      .from('challenge_votes')
      .upsert([votePayload], { onConflict: 'challenge_id,voter_id' });

    if (voteError) {
      console.error('Error casting vote:', voteError);
      return;
    }

    setChallengeUserVote(entryId);
    setChallengeVotes((prev) => {
      const next = { ...prev };
      if (previousVoteId) {
        next[previousVoteId] = Math.max(0, (next[previousVoteId] || 0) - 1);
      }
      next[entryId] = (next[entryId] || 0) + 1;
      return next;
    });
  };

  const loadGarageVehicles = async () => {
    if (!session?.user?.id) return;
    setGarageLoading(true);
    const { data, error } = await supabase
      .from('cars')
      .select('id, make, model, year, type')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching garage vehicles:', error);
      setGarageVehicles([]);
    } else {
      setGarageVehicles(data || []);
    }
    setGarageLoading(false);
  };

  const toggleGarageSelection = (carId) => {
    setSelectedGarageIds((prev) => {
      if (prev.includes(carId)) {
        return prev.filter((id) => id !== carId);
      }
      return [...prev, carId];
    });
  };

  const handleAddEntries = async () => {
    if (!session?.user?.id || !challenge || selectedGarageIds.length === 0) return;
    setSubmittingEntries(true);
    const payload = selectedGarageIds.map((carId) => ({
      challenge_id: challenge.id,
      car_id: carId,
      user_id: session.user.id,
    }));

    const { error } = await supabase.from('challenge_entries').insert(payload);

    if (error) {
      console.error('Error adding challenge entries:', error);
    } else {
      setSelectedGarageIds([]);
      setGarageModalOpen(false);
      await loadChallenge();
    }
    setSubmittingEntries(false);
  };

  const entryCarIds = useMemo(
    () => new Set(challengeEntries.map((entry) => entry.car_id)),
    [challengeEntries]
  );
  const challengeRequiresEuro = (challenge?.title || '').toLowerCase().includes('euro');
  const visibleGarageVehicles = challengeRequiresEuro
    ? garageVehicles.filter((car) => String(car.type || '').toLowerCase() === 'euro')
    : garageVehicles;

  const formatChallengeDate = (value) => {
    if (!value) return 'TBD';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'TBD';
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">Weekly Challenge</h1>
            <p className="text-gray-400 mt-2">Submit your garage builds and vote.</p>
          </div>
          <Link
            to="/explore"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Back to Explore
          </Link>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          {challengeLoading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-4" />
              <p className="text-gray-400">Loading challenge...</p>
            </div>
          ) : challenge ? (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h2 className="text-2xl font-bold text-white">{challenge.title}</h2>
                <span className="text-xs uppercase tracking-wide text-blue-300 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full">
                  Active
                </span>
              </div>
              {challenge.description ? (
                <p className="text-gray-400 mb-3">{challenge.description}</p>
              ) : null}
              <p className="text-gray-500 text-sm">
                {formatChallengeDate(challenge.starts_at)} - {formatChallengeDate(challenge.ends_at)}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  className="px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-100 hover:bg-blue-500/30 transition-colors"
                  onClick={() => {
                    setGarageModalOpen(true);
                    setSelectedGarageIds([]);
                    loadGarageVehicles();
                  }}
                >
                  Add from Garage
                </button>
                {challengeRequiresEuro && (
                  <span className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                    Euro only
                  </span>
                )}
              </div>

              <div className="mt-8">
                {challengeEntries.length === 0 ? (
                  <p className="text-gray-400 text-center py-12">
                    No entries yet. Add one from your garage.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {challengeEntries
                      .slice()
                      .sort((a, b) => (challengeVotes[b.id] || 0) - (challengeVotes[a.id] || 0))
                      .map((entry) => {
                        const car = entry.cars || {};
                        const votes = challengeVotes[entry.id] || 0;
                        const isVoted = challengeUserVote === entry.id;
                        return (
                          <div
                            key={entry.id}
                            className="bg-gray-900/60 rounded-2xl border border-gray-700/60 overflow-hidden"
                          >
                            <Link to={`/vehicle/${entry.car_id}`} className="block group">
                              <div className="relative h-56 overflow-hidden">
                                <img
                                  src={challengeCoverImages[entry.car_id] || notFound}
                                  alt={`${car.make || 'Vehicle'} ${car.model || ''}`}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                              </div>
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-lg font-semibold text-white">
                                    {car.make} {car.model}
                                  </h3>
                                  {car.year ? (
                                    <span className="text-sm text-gray-400">{car.year}</span>
                                  ) : null}
                                </div>
                              </div>
                            </Link>
                            <div className="px-4 pb-4 flex items-center justify-between">
                              <span className="text-sm text-gray-300">
                                {votes} vote{votes === 1 ? '' : 's'}
                              </span>
                              <button
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                  isVoted
                                    ? 'bg-gray-700 text-gray-300 cursor-default'
                                    : 'bg-blue-500 text-white hover:bg-blue-400'
                                }`}
                                onClick={() => handleVote(entry.id)}
                                disabled={isVoted}
                              >
                                {isVoted ? 'Voted' : 'Vote'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center py-12">No active challenge right now.</p>
          )}
        </div>
      </div>

      {garageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add Garage Cars</h3>
              <button
                onClick={() => {
                  setGarageModalOpen(false);
                  setSelectedGarageIds([]);
                }}
                className="text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>
            {garageLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-3" />
                <p className="text-gray-400">Loading garage...</p>
              </div>
            ) : visibleGarageVehicles.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                {challengeRequiresEuro
                  ? 'No Euro cars available for this challenge.'
                  : 'No cars in your garage yet.'}
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-3">
                {visibleGarageVehicles.map((car) => {
                  const isSelected = selectedGarageIds.includes(car.id);
                  const isAlreadyEntered = entryCarIds.has(car.id);
                  return (
                    <button
                      key={car.id}
                      type="button"
                      className={`w-full text-left px-4 py-3 rounded-xl border ${
                        isAlreadyEntered
                          ? 'border-gray-700/60 bg-gray-800/40 text-gray-500'
                          : isSelected
                          ? 'border-blue-500/60 bg-blue-500/10'
                          : 'border-gray-700/60 bg-gray-800/60 hover:border-blue-500/40'
                      } transition-colors`}
                      disabled={isAlreadyEntered}
                      onClick={() => {
                        if (!isAlreadyEntered) toggleGarageSelection(car.id);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold">
                            {car.make} {car.model}
                          </div>
                          <div className="text-sm text-gray-400">
                            {car.year ? `Year ${car.year}` : 'Garage vehicle'}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {isAlreadyEntered ? 'Added' : isSelected ? 'Selected' : 'Select'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                className="px-4 py-2 rounded-full border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500"
                onClick={() => {
                  setGarageModalOpen(false);
                  setSelectedGarageIds([]);
                }}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  selectedGarageIds.length === 0 || submittingEntries
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-400'
                }`}
                disabled={selectedGarageIds.length === 0 || submittingEntries}
                onClick={handleAddEntries}
              >
                {submittingEntries
                  ? 'Adding...'
                  : `Add ${selectedGarageIds.length} Car(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyChallenge;
