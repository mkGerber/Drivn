import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Signup from "./components/Signup";
import Signin from "./components/Signin";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Garage from "./components/Garage";
import Explore from "./components/Explore";
import AddVehicle from "./components/AddVehicle";
import VehicleDetails from "./components/VehicleDetails";
import DiscussionDetail from "./components/DiscussionDetail";
import Marketplace from "./components/Marketplace";

export const router = createBrowserRouter([
    {path: "/", element: <App/>},
    {path: "/signup", element: <Signup/>},
    {path: "/signin", element: <Signin/>},
    {path: "/dashboard", element: <Dashboard/>},
    {path: "/profile", element:<Profile/>},
    {path: "/garage", element:<Garage/>},
    {path: "/explore", element:<Explore/>},
    {path: "/addvehicle", element:<AddVehicle/>},
    {path: "/vehicle/:id", element:<VehicleDetails/>},
    {path: "/discussion/:id", element:<DiscussionDetail/>},
    {path: "/marketplace", element: <Marketplace/>}
]);