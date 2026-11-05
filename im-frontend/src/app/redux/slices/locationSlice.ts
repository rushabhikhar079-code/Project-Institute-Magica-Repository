import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchUserIpLocation,
  fetchCountries,
  fetchStates,
  fetchCities,
  LocationDto,
  UserIpLocationDto,
} from "../../services/locationService";

export const loadIpLocation = createAsyncThunk(
  "location/loadIpLocation",
  async () => {
    // 1. Fetch IP Location and Countries list at the same time
    const [ipGeo, countryList] = await Promise.all([
      fetchUserIpLocation(),
      fetchCountries(),
    ]);

    let stateList: LocationDto[] = [];
    let cityList: LocationDto[] = [];

    if (ipGeo?.countryId) {
      // 2. Fetch States
      stateList = await fetchStates(ipGeo.countryId);

      if (ipGeo?.stateId) {
        // 3. Fetch Cities
        cityList = await fetchCities(ipGeo.stateId);
      }
    }

    return {
      ipLocation: ipGeo,
      countries: countryList,
      initialStates: stateList,
      initialCities: cityList,
    };
  },
);

interface LocationState {
  ipLocation: UserIpLocationDto | null;
  countries: LocationDto[];
  initialStates: LocationDto[];
  initialCities: LocationDto[];
  isLoaded: boolean;
}

const initialState: LocationState = {
  ipLocation: null,
  countries: [],
  initialStates: [],
  initialCities: [],
  isLoaded: false,
};

export const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadIpLocation.fulfilled, (state, action) => {
      state.ipLocation = action.payload.ipLocation;
      state.countries = action.payload.countries;
      state.initialStates = action.payload.initialStates;
      state.initialCities = action.payload.initialCities;
      state.isLoaded = true;
    });
  },
});

export default locationSlice.reducer;
