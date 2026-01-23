import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import supabase from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';

const WeeklyChallengeScreen = ({ navigation }) => {
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

  const formatChallengeDate = (value) => {
    if (!value) return 'TBD';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'TBD';
    return date.toLocaleDateString();
  };

  const entryCarIds = new Set(challengeEntries.map((entry) => entry.car_id));
  const challengeRequiresEuro = (challenge?.title || '').toLowerCase().includes('euro');
  const visibleGarageVehicles = challengeRequiresEuro
    ? garageVehicles.filter((car) => String(car.type || '').toLowerCase() === 'euro')
    : garageVehicles;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Challenge</Text>
      <View style={styles.challengeCard}>
        {challengeLoading ? (
          <ActivityIndicator color="#38bdf8" />
        ) : challenge ? (
          <>
            <Text style={styles.challengeName}>{challenge.title}</Text>
            {challenge.description ? (
              <Text style={styles.challengeDescription}>{challenge.description}</Text>
            ) : null}
            <Text style={styles.challengeDates}>
              {formatChallengeDate(challenge.starts_at)} - {formatChallengeDate(challenge.ends_at)}
            </Text>
            <TouchableOpacity
              style={styles.challengeActionButton}
              onPress={() => {
                setGarageModalOpen(true);
                setSelectedGarageIds([]);
                loadGarageVehicles();
              }}
            >
              <Text style={styles.challengeActionText}>Add from Garage</Text>
            </TouchableOpacity>
            <View style={styles.challengeEntries}>
              {challengeEntries.length === 0 ? (
                <Text style={styles.emptyText}>No entries yet. Add one from your garage.</Text>
              ) : (
                <FlatList
                  data={challengeEntries
                    .slice()
                    .sort((a, b) => (challengeVotes[b.id] || 0) - (challengeVotes[a.id] || 0))}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const car = item.cars || {};
                    const votes = challengeVotes[item.id] || 0;
                    const isVoted = challengeUserVote === item.id;
                    return (
                      <View style={styles.entryCard}>
                        <TouchableOpacity
                          activeOpacity={0.9}
                          onPress={() =>
                            navigation.navigate('VehicleDetails', {
                              carId: item.car_id,
                              backTitle: 'Weekly Challenge',
                            })
                          }
                        >
                          <View style={styles.entryImageWrap}>
                            {challengeCoverImages[item.car_id] ? (
                              <Image
                                source={{ uri: challengeCoverImages[item.car_id] }}
                                style={styles.entryImage}
                              />
                            ) : (
                              <View style={styles.entryImagePlaceholder}>
                                <Text style={styles.entryImageText}>No Photo</Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.entryHeader}>
                            <Text style={styles.entryTitle}>
                              {car.make} {car.model}
                            </Text>
                            {car.year ? <Text style={styles.entryYear}>{car.year}</Text> : null}
                          </View>
                        </TouchableOpacity>
                        <View style={styles.voteRow}>
                          <Text style={styles.challengeVotes}>
                            {votes} vote{votes === 1 ? '' : 's'}
                          </Text>
                          <TouchableOpacity
                            style={[styles.voteButton, isVoted && styles.voteButtonDisabled]}
                            onPress={() => handleVote(item.id)}
                            disabled={isVoted}
                          >
                            <Text style={styles.voteButtonText}>
                              {isVoted ? 'Voted' : 'Vote'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }}
                />
              )}
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>No active challenge right now.</Text>
        )}
      </View>
      <Modal visible={garageModalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Garage Cars</Text>
              <TouchableOpacity
                onPress={() => {
                  setGarageModalOpen(false);
                  setSelectedGarageIds([]);
                }}
              >
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
            {garageLoading ? (
              <ActivityIndicator color="#38bdf8" />
            ) : visibleGarageVehicles.length === 0 ? (
              <Text style={styles.emptyText}>
                {challengeRequiresEuro
                  ? 'No Euro cars available for this challenge.'
                  : 'No cars in your garage yet.'}
              </Text>
            ) : (
              <FlatList
                data={visibleGarageVehicles}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isSelected = selectedGarageIds.includes(item.id);
                  const isAlreadyEntered = entryCarIds.has(item.id);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.garageRow,
                        isSelected && styles.garageRowSelected,
                        isAlreadyEntered && styles.garageRowDisabled,
                      ]}
                      onPress={() => {
                        if (!isAlreadyEntered) toggleGarageSelection(item.id);
                      }}
                      disabled={isAlreadyEntered}
                    >
                      <View style={styles.garageRowText}>
                        <Text style={styles.garageRowTitle}>
                          {item.make} {item.model}
                        </Text>
                        <Text style={styles.garageRowSubtitle}>
                          {item.year ? `Year ${item.year}` : 'Garage vehicle'}
                        </Text>
                      </View>
                      <View style={styles.garageRowAction}>
                        <Text style={styles.garageRowStatus}>
                          {isAlreadyEntered ? 'Added' : isSelected ? 'Selected' : 'Select'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
            <TouchableOpacity
              style={[
                styles.addEntriesButton,
                (selectedGarageIds.length === 0 || submittingEntries) && styles.addEntriesButtonDisabled,
              ]}
              onPress={handleAddEntries}
              disabled={selectedGarageIds.length === 0 || submittingEntries}
            >
              <Text style={styles.addEntriesButtonText}>
                {submittingEntries ? 'Adding...' : `Add ${selectedGarageIds.length} Car(s)`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
    padding: 16,
  },
  title: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  challengeCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  challengeName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  challengeDescription: {
    color: '#94a3b8',
    marginTop: 4,
    fontSize: 12,
  },
  challengeDates: {
    color: '#64748b',
    marginTop: 6,
    fontSize: 11,
  },
  challengeActionButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.6)',
  },
  challengeActionText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
  },
  challengeEntries: {
    marginTop: 10,
  },
  entryCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  entryImageWrap: {
    marginBottom: 12,
  },
  entryImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  entryImagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryImageText: {
    color: '#64748b',
    fontSize: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  entryYear: {
    color: '#94a3b8',
    fontSize: 14,
  },
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  challengeVotes: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600',
  },
  voteButton: {
    backgroundColor: '#38bdf8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  voteButtonDisabled: {
    backgroundColor: 'rgba(56, 189, 248, 0.5)',
  },
  voteButtonText: {
    color: '#0b1120',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  modalClose: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  garageRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    backgroundColor: 'rgba(11, 18, 36, 0.95)',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  garageRowSelected: {
    borderColor: 'rgba(56, 189, 248, 0.8)',
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  garageRowDisabled: {
    opacity: 0.5,
  },
  garageRowText: {
    flex: 1,
    marginRight: 10,
  },
  garageRowTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  garageRowSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  garageRowAction: {
    alignItems: 'flex-end',
  },
  garageRowStatus: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600',
  },
  addEntriesButton: {
    backgroundColor: '#38bdf8',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  addEntriesButtonDisabled: {
    backgroundColor: 'rgba(56, 189, 248, 0.5)',
  },
  addEntriesButtonText: {
    color: '#0b1120',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default WeeklyChallengeScreen;
