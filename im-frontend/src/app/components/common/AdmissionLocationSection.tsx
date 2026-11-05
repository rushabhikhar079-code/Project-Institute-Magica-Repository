import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useAppSelector } from "../../redux/hooks";
import {
  fetchCities,
  fetchCountries,
  fetchStates,
  LocationDto,
} from "../../services/locationService";
import { SearchableSelect } from "./SearchableSelect";
import { TextBox } from "./TextBox";

interface EnquiryLocationSectionProps {
  required?: boolean;
  mode: "correspondence" | "permanent";
  disabled?: boolean;
}

const toValidId = (value: unknown): number | null => {
  const id = Number(value);

  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }

  return id;
};

export function AdmissionLocationSection({
  required = false,
  mode,
  disabled = false,
}: EnquiryLocationSectionProps) {
  const {
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext();

  const {
    countries: preloadedCountries,
    initialStates,
    initialCities,
  } = useAppSelector((state) => state.location);

  const branchLocation = useAppSelector((state) => state.branch.branchLocation);

  // =====================================================
  // CORRESPONDENCE VALUES
  // =====================================================

  const correspondenceCountryId = watch("countryIdC");
  const correspondenceStateId = watch("stateIdC");
  const correspondenceCityId = watch("cityIdC");

  const correspondenceCity = watch("cityC");

  // =====================================================
  // PERMANENT VALUES
  // =====================================================

  const permanentCountryId = watch("countryId");
  const permanentStateId = watch("stateId");
  const permanentCityId = watch("cityId");

  const permanentCity = watch("cityC");

  // =====================================================
  // DROPDOWN OPTIONS
  // =====================================================

  const [countries, setCountries] = useState<LocationDto[]>([]);

  const [correspondenceStates, setCorrespondenceStates] = useState<
    LocationDto[]
  >([]);

  const [correspondenceCities, setCorrespondenceCities] = useState<
    LocationDto[]
  >([]);

  const [permanentStates, setPermanentStates] = useState<LocationDto[]>([]);

  const [permanentCities, setPermanentCities] = useState<LocationDto[]>([]);

  // =====================================================
  // 1. LOAD COUNTRIES / INITIAL LOCATION DATA
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    if (preloadedCountries?.length > 0) {
      setCountries(preloadedCountries);
    } else {
      fetchCountries()
        .then((res) => {
          if (isMounted && res) {
            setCountries(res);
          }
        })
        .catch((error) => {
          console.error("Failed to load countries:", error);
        });
    }

    if (initialStates?.length > 0) {
      setCorrespondenceStates(initialStates);
      setPermanentStates(initialStates);
    }

    if (initialCities?.length > 0) {
      setCorrespondenceCities(initialCities);
      setPermanentCities(initialCities);
    }

    return () => {
      isMounted = false;
    };
  }, [preloadedCountries, initialStates, initialCities]);

  // =====================================================
  // 2. DEFAULT IP LOCATION
  // =====================================================

  // =====================================================
  // 2. DEFAULT IP LOCATION
  // =====================================================

  useEffect(() => {
    const countryId = toValidId(branchLocation?.countryId);

    if (countryId === null) {
      return;
    }

    const stateId = toValidId(branchLocation?.stateId);
    const cityId = toValidId(branchLocation?.cityId);

    if (mode === "correspondence") {
      const existingCountryId = toValidId(correspondenceCountryId);
      const existingStateId = toValidId(correspondenceStateId);
      const existingCityId = toValidId(correspondenceCityId);

      const correspondenceEmpty =
        existingCountryId === null &&
        existingStateId === null &&
        existingCityId === null;

      if (countries.length > 0 && !watch("countryC")) {
        const selectedCountry = countries.find(
          (country) => toValidId(country.id) === countryId,
        );

        if (selectedCountry) {
          setValue("countryC", selectedCountry.name, {
            shouldValidate: true,
            shouldDirty: false,
          });
        }
      }

      if (!correspondenceEmpty) {
        return;
      }

      // Country ID
      setValue("countryIdC", countryId, {
        shouldValidate: true,
      });

      // Load states for branch country
      fetchStates(countryId)
        .then((states) => {
          setCorrespondenceStates(states);

          const selectedState = states.find(
            (state) => toValidId(state.id) === stateId,
          );

          if (selectedState) {
            setValue("state", selectedState.name);
            setValue("stateIdC", stateId, {
              shouldValidate: true,
            });
          }

          // Load cities after state is known
          if (stateId !== null) {
            return fetchCities(stateId);
          }

          return [];
        })
        .then((cities) => {
          setCorrespondenceCities(cities);

          const selectedCity = cities.find(
            (city) => toValidId(city.id) === cityId,
          );

          if (selectedCity) {
            setValue("city", selectedCity.name);
            setValue("cityIdC", cityId, {
              shouldValidate: true,
            });
          }

          trigger(["countryIdC", "stateIdC", "cityIdC"]);
        })
        .catch((error) => {
          console.error(
            "Failed to load branch correspondence location:",
            error,
          );
          setCorrespondenceStates([]);
          setCorrespondenceCities([]);
        });

      return;
    }

    if (mode === "permanent") {
      const existingCountryId = toValidId(permanentCountryId);
      const existingStateId = toValidId(permanentStateId);
      const existingCityId = toValidId(permanentCityId);

      const permanentEmpty =
        existingCountryId === null &&
        existingStateId === null &&
        existingCityId === null;

      if (countries.length > 0 && !watch("country")) {
        const selectedCountry = countries.find(
          (country) => toValidId(country.id) === countryId,
        );

        if (selectedCountry) {
          setValue("country", selectedCountry.name, {
            shouldValidate: true,
            shouldDirty: false,
          });
        }
      }

      if (!permanentEmpty) {
        return;
      }

      // Country ID
      setValue("countryId", countryId, {
        shouldValidate: true,
      });

      // Load states
      fetchStates(countryId)
        .then((states) => {
          setPermanentStates(states);

          const selectedState = states.find(
            (state) => toValidId(state.id) === stateId,
          );

          if (selectedState) {
            setValue("stateC", selectedState.name);
            setValue("stateId", stateId, {
              shouldValidate: true,
            });
          }

          if (stateId !== null) {
            return fetchCities(stateId);
          }

          return [];
        })
        .then((cities) => {
          setPermanentCities(cities);

          const selectedCity = cities.find(
            (city) => toValidId(city.id) === cityId,
          );

          if (selectedCity) {
            setValue("cityC", selectedCity.name);
            setValue("cityId", cityId, {
              shouldValidate: true,
            });
          }

          trigger(["countryId", "stateId", "cityId"]);
        })
        .catch((error) => {
          console.error("Failed to load branch permanent location:", error);
          setPermanentStates([]);
          setPermanentCities([]);
        });

      return;
    }
  }, [
    mode,
    branchLocation,
    countries,
    correspondenceCountryId,
    correspondenceStateId,
    correspondenceCityId,
    permanentCountryId,
    permanentStateId,
    permanentCityId,
    setValue,
    trigger,
  ]);

  // =====================================================
  // 3. LOAD CORRESPONDENCE STATES
  // =====================================================

  useEffect(() => {
    if (mode !== "correspondence") {
      return;
    }

    const countryId = toValidId(correspondenceCountryId);

    if (countryId === null) {
      setCorrespondenceStates([]);
      return;
    }

    fetchStates(countryId)
      .then(setCorrespondenceStates)
      .catch((error) => {
        console.error("Failed to fetch correspondence states:", error);
        setCorrespondenceStates([]);
      });
  }, [mode, correspondenceCountryId]);

  // =====================================================
  // 4. LOAD CORRESPONDENCE CITIES
  // =====================================================

  useEffect(() => {
    if (mode !== "correspondence") {
      return;
    }

    const stateId = toValidId(correspondenceStateId);

    if (stateId === null) {
      setCorrespondenceCities([]);
      return;
    }

    fetchCities(stateId)
      .then(setCorrespondenceCities)
      .catch((error) => {
        console.error("Failed to fetch correspondence cities:", error);
        setCorrespondenceCities([]);
      });
  }, [mode, correspondenceStateId]);

  // =====================================================
  // 5. LOAD PERMANENT STATES
  // =====================================================

  useEffect(() => {
    if (mode !== "permanent") {
      return;
    }

    const countryId = toValidId(permanentCountryId);

    if (countryId === null) {
      setPermanentStates([]);
      return;
    }

    fetchStates(countryId)
      .then(setPermanentStates)
      .catch((error) => {
        console.error("Failed to fetch permanent states:", error);
        setPermanentStates([]);
      });
  }, [mode, permanentCountryId]);

  // =====================================================
  // 6. LOAD PERMANENT CITIES
  // =====================================================

  useEffect(() => {
    if (mode !== "permanent") {
      return;
    }

    const stateId = toValidId(permanentStateId);

    if (stateId === null) {
      setPermanentCities([]);
      return;
    }

    fetchCities(stateId)
      .then(setPermanentCities)
      .catch((error) => {
        console.error("Failed to fetch permanent cities:", error);
        setPermanentCities([]);
      });
  }, [mode, permanentStateId]);

  // =====================================================
  // CORRESPONDENCE COUNTRY
  // =====================================================

  const handleCorrespondenceCountry = (selectedName: string) => {
    const countryObj = countries.find(
      (country) => country.name === selectedName,
    );

    const countryId = toValidId(countryObj?.id);

    if (countryId === null) {
      setValue("countryC", "");
      setValue("countryIdC", 0, {
        shouldValidate: true,
      });

      setValue("stateC", "");
      setValue("stateIdC", 0, {
        shouldValidate: true,
      });

      setValue("cityC", "");
      setValue("cityIdC", 0, {
        shouldValidate: true,
      });

      setValue("otherCityC", "");

      setCorrespondenceStates([]);
      setCorrespondenceCities([]);

      return;
    }

    setValue("countryC", selectedName);

    setValue("countryIdC", countryId, {
      shouldValidate: true,
    });

    // Reset state
    setValue("stateC", "");
    setValue("stateIdC", 0, {
      shouldValidate: true,
    });

    // Reset city
    setValue("cityC", "");
    setValue("cityIdC", 0, {
      shouldValidate: true,
    });

    setValue("otherCityC", "");

    setCorrespondenceCities([]);

    fetchStates(countryId)
      .then(setCorrespondenceStates)
      .catch((error) => {
        console.error("Failed to fetch correspondence states:", error);
        setCorrespondenceStates([]);
      });

    trigger(["countryIdC", "stateIdC", "cityIdC"]);
  };

  // =====================================================
  // CORRESPONDENCE STATE
  // =====================================================

  const handleCorrespondenceState = (selectedName: string) => {
    const stateObj = correspondenceStates.find(
      (state) => state.name === selectedName,
    );

    const stateId = toValidId(stateObj?.id);

    if (stateId === null) {
      setValue("stateC", "");
      setValue("stateIdC", 0, {
        shouldValidate: true,
      });

      setValue("cityC", "");
      setValue("cityIdC", 0, {
        shouldValidate: true,
      });

      setCorrespondenceCities([]);

      return;
    }

    setValue("stateC", selectedName);

    setValue("stateIdC", stateId, {
      shouldValidate: true,
    });

    // Reset city
    setValue("cityC", "");
    setValue("cityIdC", 0, {
      shouldValidate: true,
    });

    setValue("otherCityC", "");

    setCorrespondenceCities([]);

    fetchCities(stateId)
      .then(setCorrespondenceCities)
      .catch((error) => {
        console.error("Failed to fetch correspondence cities:", error);
        setCorrespondenceCities([]);
      });

    trigger(["stateIdC", "cityIdC"]);
  };

  // =====================================================
  // CORRESPONDENCE CITY
  // =====================================================

  const handleCorrespondenceCity = (selectedName: string) => {
    const cityObj = correspondenceCities.find(
      (city) => city.name === selectedName,
    );

    const isOther = selectedName.toLowerCase() === "other";

    const cityId = isOther ? 999 : toValidId(cityObj?.id);

    setValue("cityC", selectedName);

    setValue("cityIdC", cityId ?? 0, {
      shouldValidate: true,
    });

    if (!isOther) {
      setValue("otherCityC", "");
    }

    trigger(["cityIdC", "otherCityC"]);
  };

  // =====================================================
  // PERMANENT COUNTRY
  // =====================================================

  const handlePermanentCountry = (selectedName: string) => {
    const countryObj = countries.find(
      (country) => country.name === selectedName,
    );

    const countryId = toValidId(countryObj?.id);

    if (countryId === null) {
      setValue("country", "");
      setValue("countryId", 0, {
        shouldValidate: true,
      });

      setValue("state", "");
      setValue("stateId", 0, {
        shouldValidate: true,
      });

      setValue("city", "");
      setValue("cityId", 0, {
        shouldValidate: true,
      });

      setValue("otherCity", "");

      setPermanentStates([]);
      setPermanentCities([]);

      return;
    }

    setValue("country", selectedName);

    setValue("countryId", countryId, {
      shouldValidate: true,
    });

    // Reset state
    setValue("state", "");
    setValue("stateId", 0, {
      shouldValidate: true,
    });

    // Reset city
    setValue("city", "");
    setValue("cityId", 0, {
      shouldValidate: true,
    });

    setValue("otherCity", "");

    setPermanentCities([]);

    fetchStates(countryId)
      .then(setPermanentStates)
      .catch((error) => {
        console.error("Failed to fetch permanent states:", error);
        setPermanentStates([]);
      });

    trigger(["countryId", "stateId", "cityId"]);
  };

  // =====================================================
  // PERMANENT STATE
  // =====================================================

  const handlePermanentState = (selectedName: string) => {
    const stateObj = permanentStates.find(
      (state) => state.name === selectedName,
    );

    const stateId = toValidId(stateObj?.id);

    if (stateId === null) {
      setValue("state", "");
      setValue("stateId", 0, {
        shouldValidate: true,
      });

      setValue("city", "");
      setValue("cityId", 0, {
        shouldValidate: true,
      });

      setPermanentCities([]);

      return;
    }

    setValue("state", selectedName);

    setValue("stateId", stateId, {
      shouldValidate: true,
    });

    // Reset city
    setValue("city", "");
    setValue("cityId", 0, {
      shouldValidate: true,
    });

    setValue("otherCity", "");

    setPermanentCities([]);

    fetchCities(stateId)
      .then(setPermanentCities)
      .catch((error) => {
        console.error("Failed to fetch permanent cities:", error);
        setPermanentCities([]);
      });

    trigger(["stateId", "cityId"]);
  };

  // =====================================================
  // PERMANENT CITY
  // =====================================================

  const handlePermanentCity = (selectedName: string) => {
    const cityObj = permanentCities.find((city) => city.name === selectedName);

    const isOther = selectedName.toLowerCase() === "other";

    const cityId = isOther ? 999 : toValidId(cityObj?.id);

    setValue("city", selectedName);

    setValue("cityId", cityId ?? 0, {
      shouldValidate: true,
    });

    if (!isOther) {
      setValue("otherCity", "");
    }

    trigger(["cityId", "otherCity"]);
  };

  // =====================================================
  // CORRESPONDENCE UI
  // =====================================================

  if (mode === "correspondence") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Country */}
        <div className="flex flex-col gap-1.5">
          <SearchableSelect
            name="countryC"
            label="Country"
            required={required}
            placeholder="Select Country"
            options={countries.map((country) => country.name)}
            onSelectCallback={handleCorrespondenceCountry}
          />

          {errors.countryidc && (
            <span className="text-xs text-red-500">
              {errors.countryidc.message as string}
            </span>
          )}
        </div>

        {/* State */}
        <div className="flex flex-col gap-1.5">
          <SearchableSelect
            name="stateC"
            label="State"
            required={required}
            placeholder="Select State"
            options={correspondenceStates.map((state) => state.name)}
            onSelectCallback={handleCorrespondenceState}
          />

          {errors.stateidc && (
            <span className="text-xs text-red-500">
              {errors.stateidc.message as string}
            </span>
          )}
        </div>

        {/* City */}
        <div className="flex flex-col gap-1.5">
          <SearchableSelect
            name="cityC"
            label="City"
            required={required}
            placeholder="Select City"
            options={correspondenceCities.map((city) => city.name)}
            showOther
            onSelectCallback={handleCorrespondenceCity}
          />

          {errors.cityidc && (
            <span className="text-xs text-red-500">
              {errors.cityidc.message as string}
            </span>
          )}
        </div>

        {/* Other City */}
        {correspondenceCity?.trim().toLowerCase() === "other" && (
          <TextBox
            name="otherCityC"
            label="Specify City"
            placeholder="Enter custom city"
          />
        )}

        {/* Pincode */}
        <TextBox
          name="pinCodeC"
          label="Pin Code"
          required={false}
          placeholder="Enter pin code"
          allowOnly="numeric"
          maxLength={6}
        />
      </div>
    );
  }

  // =====================================================
  // PERMANENT UI
  // =====================================================

  return (
    <fieldset disabled={disabled}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Country */}
        <div className="flex flex-col gap-1.5">
          <SearchableSelect
            name="country"
            label="Country"
            required={required}
            placeholder="Select Country"
            options={countries.map((country) => country.name)}
            onSelectCallback={handlePermanentCountry}
          />

          {errors.countryid && (
            <span className="text-xs text-red-500">
              {errors.countryid.message as string}
            </span>
          )}
        </div>

        {/* State */}
        <div className="flex flex-col gap-1.5">
          <SearchableSelect
            name="state"
            label="State"
            required={required}
            placeholder="Select State"
            options={permanentStates.map((state) => state.name)}
            onSelectCallback={handlePermanentState}
          />

          {errors.stateid && (
            <span className="text-xs text-red-500">
              {errors.stateid.message as string}
            </span>
          )}
        </div>

        {/* City */}
        <div className="flex flex-col gap-1.5">
          <SearchableSelect
            name="city"
            label="City"
            required={required}
            placeholder="Select City"
            options={permanentCities.map((city) => city.name)}
            showOther
            onSelectCallback={handlePermanentCity}
          />

          {errors.cityid && (
            <span className="text-xs text-red-500">
              {errors.cityid.message as string}
            </span>
          )}
        </div>

        {/* Other City */}
        {permanentCity?.trim().toLowerCase() === "other" && (
          <TextBox
            name="otherCity"
            label="Specify City"
            placeholder="Enter custom city"
          />
        )}

        {/* Pincode */}
        <TextBox
          name="pinCode"
          label="Pin Code"
          required={false}
          placeholder="Enter pin code"
          allowOnly="numeric"
          maxLength={6}
        />
      </div>
    </fieldset>
  );
}
