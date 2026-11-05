import api from "./api";

export interface LocationDto {
  id: number;
  name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface UserIpLocationDto {
  countryId: number | null;
  countryName: string | null;
  stateId: number | null;
  stateName: string | null;
  cityId: number | null;
  cityName: string | null;
}
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const fetchCountries = async (): Promise<LocationDto[]> => {
  // Notice capital /Common/countries
  const res = await api.get<ApiResponse<LocationDto[]>>("/Common/countries");
  const data = res.data.data || [];
  return data.filter((item) => item.name.toLowerCase() !== "other");
};

export const fetchStates = async (
  countryId: number,
): Promise<LocationDto[]> => {
  const res = await api.get<ApiResponse<LocationDto[]>>(
    `/Common/states/${countryId}`,
  );
  const data = res.data.data || [];
  return data.filter((item) => item.name.toLowerCase() !== "other");
};

export const fetchCities = async (stateId: number): Promise<LocationDto[]> => {
  const res = await api.get<ApiResponse<LocationDto[]>>(
    `/Common/cities/${stateId}`,
  );
  return res.data.data || [];
};

export const fetchUserIpLocation =
  async (): Promise<UserIpLocationDto | null> => {
    try {
      const res = await api.get<ApiResponse<UserIpLocationDto>>(
        "/Common/ip-location",
      );
      return res.data.data || null;
    } catch (error) {
      console.warn("Failed to resolve IP location:", error);
      return null;
    }
  };
