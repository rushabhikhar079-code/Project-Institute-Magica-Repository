// import { useEffect, useState } from "react";
// import { useFormContext } from "react-hook-form";
// import { useAppSelector } from "../../redux/hooks";
// import {
//   fetchCities,
//   fetchStates,
//   LocationDto,
// } from "../../services/locationService";
// import { SearchableSelect } from "./SearchableSelect";
// import { TextBox } from "./TextBox";

// export function LocationSection() {
//   const { watch, setValue } = useFormContext();
//   const {
//     ipLocation,
//     countries: preloadedCountries,
//     initialStates,
//     initialCities,
//   } = useAppSelector((state) => state.location);
//   const selectedCountry = watch("country");
//   const selectedState = watch("state");
//   const selectedCity = watch("city");
//   const countryId = watch("countryId");
//   const stateId = watch("stateId");
//   const cityId = watch("cityId");

//   const [countries, setCountries] = useState<LocationDto[]>([]);
//   const [states, setStates] = useState<LocationDto[]>([]);
//   const [cities, setCities] = useState<LocationDto[]>([]);

//   // 1. Initial Load: Fetch master countries & auto-detect IP location
//   // useEffect(() => {
//   //   if (preloadedCountries.length > 0) setCountries(preloadedCountries);
//   //   if (initialStates.length > 0) setStates(initialStates);
//   //   if (initialCities.length > 0) setCities(initialCities);

//   //   if (ipLocation && ipLocation.countryId) {
//   //     setValue("country", ipLocation.countryName);
//   //     setValue("countryId", ipLocation.countryId);
//   //     setValue("state", ipLocation.stateName);
//   //     setValue("stateId", ipLocation.stateId);
//   //     setValue("city", ipLocation.cityName);
//   //     setValue("cityId", ipLocation.cityId);
//   //   }
//   // }, [ipLocation, preloadedCountries, initialStates, initialCities, setValue]);
//   useEffect(() => {
//     if (preloadedCountries.length > 0) {
//       setCountries(preloadedCountries);
//     }

//     if (initialStates.length > 0) {
//       setStates(initialStates);
//     }

//     if (initialCities.length > 0) {
//       setCities(initialCities);
//     }

//     // Only use IP location when the form doesn't already
//     // have an edit branch location.
//     if (
//       ipLocation &&
//       ipLocation.countryId &&
//       !countryId &&
//       !stateId &&
//       !cityId
//     ) {
//       setValue("country", ipLocation.countryName);
//       setValue("countryId", ipLocation.countryId);

//       setValue("state", ipLocation.stateName);
//       setValue("stateId", ipLocation.stateId);

//       setValue("city", ipLocation.cityName);
//       setValue("cityId", ipLocation.cityId);
//     }
//   }, [
//     ipLocation,
//     preloadedCountries,
//     initialStates,
//     initialCities,
//     countryId,
//     stateId,
//     cityId,
//     setValue,
//   ]);
//   useEffect(() => {
//     if (!countryId || countries.length === 0) {
//       return;
//     }

//     const loadEditLocation = async () => {
//       try {
//         const country = countries.find(
//           (c) => Number(c.id) === Number(countryId),
//         );

//         if (!country) return;

//         setValue("country", country.name);

//         if (!stateId) return;

//         const stateList = await fetchStates(Number(countryId));
//         setStates(stateList);

//         const state = stateList.find((s) => Number(s.id) === Number(stateId));

//         if (!state) return;

//         setValue("state", state.name);

//         // CITY
//         if (Number(cityId) === 0) {
//           if (watch("otherCity")) {
//             setValue("city", "Other");
//           }

//           return;
//         }

//         const cityList = await fetchCities(Number(stateId));
//         setCities(cityList);

//         const city = cityList.find((c) => Number(c.id) === Number(cityId));

//         if (city) {
//           setValue("city", city.name);
//         }
//       } catch (error) {
//         console.error("Failed to load edit location:", error);
//       }
//     };

//     loadEditLocation();
//   }, [countryId, stateId, cityId, countries, setValue, watch]);
//   // 2. Fetch states when user manually changes country
//   useEffect(() => {
//     if (!selectedCountry || selectedCountry === "Other") {
//       setStates([]);
//       return;
//     }

//     const selectedCountryObj = countries.find(
//       (c) => c.name === selectedCountry,
//     );

//     if (selectedCountryObj?.id) {
//       fetchStates(selectedCountryObj.id)
//         .then((data) => setStates(data))
//         .catch((err) => console.error("Failed to fetch states:", err));
//     }
//   }, [selectedCountry, countries]);

//   // 3. Fetch cities when user manually changes state
//   useEffect(() => {
//     if (!selectedState || selectedState === "Other" || !selectedCountry) {
//       setCities([]);
//       return;
//     }

//     const selectedStateObj = states.find((s) => s.name === selectedState);

//     if (selectedStateObj?.id) {
//       fetchCities(selectedStateObj.id)
//         .then((data) => setCities(data))
//         .catch((err) => console.error("Failed to fetch cities:", err));
//     }
//   }, [selectedCountry, selectedState, states]);

//   return (
//     <>
//       {/* 1. Country */}
//       <div className="flex flex-col gap-1.5">
//         <SearchableSelect
//           name="country"
//           label="Country"
//           placeholder="Select Country"
//           options={countries.map((c) => c.name)}
//           onSelectCallback={(selectedName) => {
//             const countryObj = countries.find((c) => c.name === selectedName);

//             if (!countryObj) return;

//             // Same country → don't reset state/city
//             if (Number(countryId) === Number(countryObj.id)) {
//               return;
//             }

//             setValue("countryId", countryObj.id);

//             setValue("state", "");
//             setValue("stateId", 0);

//             setValue("city", "");
//             setValue("cityId", 0);
//           }}
//         />
//         {selectedCountry === "Other" && (
//           <TextBox
//             name="customCountry"
//             label="Specify Country"
//             placeholder="Enter custom country"
//           />
//         )}
//       </div>

//       {/* 2. State */}
//       <div className="flex flex-col gap-1.5">
//         <SearchableSelect
//           name="state"
//           label="State"
//           placeholder="Select State"
//           options={states.map((s) => s.name)}
//           onSelectCallback={(selectedName) => {
//             const stateObj = states.find((s) => s.name === selectedName);

//             if (!stateObj) return;

//             // Same state → don't reset city
//             if (Number(stateId) === Number(stateObj.id)) {
//               return;
//             }

//             setValue("stateId", stateObj.id);

//             setValue("city", "");
//             setValue("cityId", 0);
//           }}
//         />
//         {selectedState === "Other" && (
//           <TextBox
//             name="customState"
//             label="Specify State"
//             placeholder="Enter custom state"
//           />
//         )}
//       </div>

//       {/* 3. City */}
//       <div className="flex flex-col gap-1.5">
//         <SearchableSelect
//           name="city"
//           label="City"
//           placeholder="Select City"
//           options={cities.map((c) => c.name)}
//           showOther={true}
//           onSelectCallback={(selectedName) => {
//             const cityObj = cities.find((c) => c.name === selectedName);
//             setValue("city", selectedName);
//             setValue("cityId", cityObj?.id || 0);
//             if (selectedName.toLowerCase() !== "other") {
//               setValue("otherCity", "");
//             }
//           }}
//         />
//       </div>

//       <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
//         {selectedCity === "Other" && (
//           <TextBox
//             name="otherCity"
//             label="Specify City"
//             placeholder="Enter custom city"
//           />
//         )}
//       </div>
//     </>
//   );
// }
// import { useEffect, useState, useRef } from "react";
// import { useFormContext } from "react-hook-form";
// import { useAppSelector } from "../../redux/hooks";
// import {
//   fetchCities,
//   fetchStates,
//   LocationDto,
// } from "../../services/locationService";
// import { SearchableSelect } from "./SearchableSelect";
// import { TextBox } from "./TextBox";

// export function LocationSection() {
//   const {
//     watch,
//     setValue,
//     trigger,
//     formState: { errors },
//   } = useFormContext();

//   const {
//     ipLocation,
//     countries: preloadedCountries,
//     initialStates,
//     initialCities,
//   } = useAppSelector((state) => state.location);

//   const selectedCountry = watch("country");
//   const selectedState = watch("state");
//   const selectedCity = watch("city");
//   const countryId = watch("countryId");
//   const stateId = watch("stateId");
//   const cityId = watch("cityId");

//   const [countries, setCountries] = useState<LocationDto[]>([]);
//   const [states, setStates] = useState<LocationDto[]>([]);
//   const [cities, setCities] = useState<LocationDto[]>([]);
//   const lastLoadedCountryId = useRef<number | null>(null);

//   // 1. Initial Load: Hydrate preloaded store data
//   useEffect(() => {
//     if (preloadedCountries.length > 0) setCountries(preloadedCountries);
//     if (initialStates.length > 0) setStates(initialStates);
//     if (initialCities.length > 0) setCities(initialCities);
//   }, [preloadedCountries, initialStates, initialCities]);

//   // 2. Load Location Data on Edit Mode
//   useEffect(() => {
//     if (!countryId || Number(countryId) === 0 || countries.length === 0) return;
//     if (lastLoadedCountryId.current === Number(countryId)) return;

//     let isMounted = true;

//     const loadEditLocation = async () => {
//       try {
//         lastLoadedCountryId.current = Number(countryId);

//         const country = countries.find(
//           (c) => Number(c.id) === Number(countryId),
//         );
//         if (country) setValue("country", country.name);

//         const stateList = await fetchStates(Number(countryId));
//         if (!isMounted) return;
//         setStates(stateList);

//         const state = stateList.find((s) => Number(s.id) === Number(stateId));
//         if (state) setValue("state", state.name);

//         if (stateId && Number(stateId) !== 0) {
//           const cityList = await fetchCities(Number(stateId));
//           if (!isMounted) return;
//           setCities(cityList);

//           const city = cityList.find((c) => Number(c.id) === Number(cityId));
//           if (city) {
//             setValue("city", city.name);
//           } else if (watch("otherCity")) {
//             setValue("city", "Other");
//           }
//         }
//       } catch (error) {
//         console.error("Failed to load edit location:", error);
//       }
//     };

//     loadEditLocation();

//     return () => {
//       isMounted = false;
//     };
//   }, [countryId, countries.length]);

//   // 3. IP Location Fallback
//   useEffect(() => {
//     const isPristine =
//       (!countryId || Number(countryId) === 0) &&
//       (!stateId || Number(stateId) === 0) &&
//       (!cityId || Number(cityId) === 0);

//     if (ipLocation && ipLocation.countryId && isPristine) {
//       setValue("country", ipLocation.countryName);
//       setValue("countryId", Number(ipLocation.countryId), {
//         shouldValidate: true,
//       });

//       setValue("state", ipLocation.stateName);
//       setValue("stateId", Number(ipLocation.stateId), { shouldValidate: true });

//       setValue("city", ipLocation.cityName);
//       setValue("cityId", Number(ipLocation.cityId), { shouldValidate: true });
//     }
//   }, [ipLocation]);

//   return (
//     <>
//       {/* 1. Country */}
//       <div className="flex flex-col gap-1.5">
//         <SearchableSelect
//           name="country"
//           label="Country"
//           placeholder="Select Country"
//           options={countries.map((c) => c.name)}
//           onSelectCallback={(selectedName) => {
//             const countryObj = countries.find((c) => c.name === selectedName);

//             if (!countryObj) {
//               setValue("countryId", 0, { shouldValidate: true });
//               return;
//             }

//             setValue("countryId", Number(countryObj.id), {
//               shouldValidate: true,
//             });
//             setValue("state", "");
//             setValue("stateId", 0, { shouldValidate: true });
//             setValue("city", "");
//             setValue("cityId", 0, { shouldValidate: true });

//             fetchStates(countryObj.id).then(setStates);
//             trigger(["countryId", "stateId", "cityId"]);
//           }}
//         />
//         {errors.countryId && (
//           <span className="text-xs text-red-500">
//             {errors.countryId.message as string}
//           </span>
//         )}
//       </div>

//       {/* 2. State */}
//       <div className="flex flex-col gap-1.5">
//         <SearchableSelect
//           name="state"
//           label="State"
//           placeholder="Select State"
//           options={states.map((s) => s.name)}
//           onSelectCallback={(selectedName) => {
//             const stateObj = states.find((s) => s.name === selectedName);

//             if (!stateObj) {
//               setValue("stateId", 0, { shouldValidate: true });
//               return;
//             }

//             setValue("stateId", Number(stateObj.id), { shouldValidate: true });
//             setValue("city", "");
//             setValue("cityId", 0, { shouldValidate: true });

//             fetchCities(stateObj.id).then(setCities);
//             trigger(["stateId", "cityId"]);
//           }}
//         />
//         {errors.stateId && (
//           <span className="text-xs text-red-500">
//             {errors.stateId.message as string}
//           </span>
//         )}
//       </div>

//       {/* 3. City */}
//       <div className="flex flex-col gap-1.5">
//         <SearchableSelect
//           name="city"
//           label="City"
//           placeholder="Select City"
//           options={cities.map((c) => c.name)}
//           showOther={true}
//           onSelectCallback={(selectedName) => {
//             const cityObj = cities.find((c) => c.name === selectedName);
//             setValue("city", selectedName);

//             const isOther = selectedName.toLowerCase() === "other";
//             const targetCityId = isOther ? 999 : Number(cityObj?.id || 0);

//             setValue("cityId", targetCityId, { shouldValidate: true });

//             if (!isOther) {
//               setValue("otherCity", "");
//             }
//             trigger(["cityId", "otherCity"]);
//           }}
//         />
//         {errors.cityId && (
//           <span className="text-xs text-red-500">
//             {errors.cityId.message as string}
//           </span>
//         )}
//       </div>

//       <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
//         {selectedCity === "Other" && (
//           <TextBox
//             name="otherCity"
//             label="Specify City"
//             placeholder="Enter custom city"
//           />
//         )}
//       </div>
//     </>
//   );
// }
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
interface LocationSectionProps {
  required?: boolean;
}

export function LocationSection({ required = true }: LocationSectionProps) {
  const {
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useFormContext();
  const {
    ipLocation,
    countries: preloadedCountries,
    initialStates,
    initialCities,
  } = useAppSelector((state) => state.location);

  const selectedCity = watch("city");
  const countryId = watch("countryId");
  const stateId = watch("stateId");
  const cityId = watch("cityId");

  const [countries, setCountries] = useState<LocationDto[]>([]);
  const [states, setStates] = useState<LocationDto[]>([]);
  const [cities, setCities] = useState<LocationDto[]>([]);

  // 1. Mount Load: Populate countries, states, and cities lists
  useEffect(() => {
    let isMounted = true;

    // Load Countries
    if (preloadedCountries && preloadedCountries.length > 0) {
      setCountries(preloadedCountries);
    } else {
      fetchCountries()
        .then((res) => {
          if (isMounted && res) setCountries(res);
        })
        .catch(console.error);
    }

    // Load initial states if available
    if (initialStates.length > 0) setStates(initialStates);
    if (initialCities.length > 0) setCities(initialCities);

    return () => {
      isMounted = false;
    };
  }, [preloadedCountries, initialStates, initialCities]);

  // 2. Hydrate options dropdowns when editing without firing recursive re-renders
  useEffect(() => {
    const loadEditLocation = async () => {
      if (!countryId || Number(countryId) === 0 || countries.length === 0) {
        return;
      }

      try {
        // COUNTRY
        const country = countries.find(
          (item) => Number(item.id) === Number(countryId),
        );

        if (country) {
          setValue("country", country.name, {
            shouldValidate: false,
          });
        }

        // STATE
        if (!stateId || Number(stateId) === 0) {
          return;
        }

        const stateList = await fetchStates(Number(countryId));
        setStates(stateList);

        const state = stateList.find(
          (item) => Number(item.id) === Number(stateId),
        );

        if (state) {
          setValue("state", state.name, {
            shouldValidate: false,
          });
        }

        // CITY
        if (!cityId || Number(cityId) === 0) {
          if (getValues("otherCity")) {
            setValue("city", "Other", {
              shouldValidate: false,
            });
          }

          return;
        }

        const cityList = await fetchCities(Number(stateId));
        setCities(cityList);

        const city = cityList.find(
          (item) => Number(item.id) === Number(cityId),
        );

        if (city) {
          setValue("city", city.name, {
            shouldValidate: false,
          });
        }
      } catch (error) {
        console.error("Failed to load edit location:", error);
      }
    };

    loadEditLocation();
  }, [countryId, stateId, cityId, countries, setValue, getValues]);

  // 3. IP Location Fallback (New mode only)
  useEffect(() => {
    const isPristine =
      (!countryId || Number(countryId) === 0) &&
      (!stateId || Number(stateId) === 0) &&
      (!cityId || Number(cityId) === 0);

    if (ipLocation && ipLocation.countryId && isPristine) {
      setValue("country", ipLocation.countryName);
      setValue("countryId", Number(ipLocation.countryId), {
        shouldValidate: true,
      });

      setValue("state", ipLocation.stateName);
      setValue("stateId", Number(ipLocation.stateId), { shouldValidate: true });

      setValue("city", ipLocation.cityName);
      setValue("cityId", Number(ipLocation.cityId), { shouldValidate: true });
    }
  }, [ipLocation]);

  return (
    <>
      {/* 1. Country */}
      <div className="flex flex-col gap-1.5">
        <SearchableSelect
          name="country"
          label="Country"
          required={required}
          placeholder="Select Country"
          options={countries.map((c) => c.name)}
          onSelectCallback={(selectedName) => {
            const countryObj = countries.find((c) => c.name === selectedName);

            if (!countryObj) {
              setValue("countryId", 0, { shouldValidate: true });
              return;
            }

            setValue("countryId", Number(countryObj.id), {
              shouldValidate: true,
            });
            setValue("state", "");
            setValue("stateId", 0, { shouldValidate: true });
            setValue("city", "");
            setValue("cityId", 0, { shouldValidate: true });

            fetchStates(Number(countryObj.id)).then(setStates);
            trigger(["countryId", "stateId", "cityId"]);
          }}
        />
        {errors.countryId && (
          <span className="text-xs text-red-500">
            {errors.countryId.message as string}
          </span>
        )}
      </div>

      {/* 2. State */}
      <div className="flex flex-col gap-1.5">
        <SearchableSelect
          name="state"
          label="State"
          required={required}
          placeholder="Select State"
          options={states.map((s) => s.name)}
          onSelectCallback={(selectedName) => {
            const stateObj = states.find((s) => s.name === selectedName);

            if (!stateObj) {
              setValue("stateId", 0, { shouldValidate: true });
              return;
            }

            setValue("stateId", Number(stateObj.id), { shouldValidate: true });
            setValue("city", "");
            setValue("cityId", 0, { shouldValidate: true });

            fetchCities(Number(stateObj.id)).then(setCities);
            trigger(["stateId", "cityId"]);
          }}
        />
        {errors.stateId && (
          <span className="text-xs text-red-500">
            {errors.stateId.message as string}
          </span>
        )}
      </div>

      {/* 3. City */}
      <div className="flex flex-col gap-1.5">
        <SearchableSelect
          name="city"
          label="City"
          required={required}
          placeholder="Select City"
          options={cities.map((c) => c.name)}
          showOther={true}
          onSelectCallback={(selectedName) => {
            const cityObj = cities.find((c) => c.name === selectedName);
            setValue("city", selectedName);

            const isOther = selectedName.toLowerCase() === "other";
            const targetCityId = isOther ? 999 : Number(cityObj?.id || 0);

            setValue("cityId", targetCityId, { shouldValidate: true });

            if (!isOther) {
              setValue("otherCity", "");
            }
            trigger(["cityId", "otherCity"]);
          }}
        />
        {errors.cityId && (
          <span className="text-xs text-red-500">
            {errors.cityId.message as string}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
        {selectedCity === "Other" && (
          <TextBox
            name="otherCity"
            label="Specify City"
            placeholder="Enter custom city"
          />
        )}
      </div>
    </>
  );
}
