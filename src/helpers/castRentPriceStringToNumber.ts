interface VehicleResult {
  id: string;
  vehicle_name: string;
  type: string;
  registration_number: string;
  daily_rent_price: string;
  availability_status: string;
}

const castDailyRentPriceStringToNumber = (result: VehicleResult[]) => {
  let modifiedResult;
  if (result.length !== 0) {
    modifiedResult = result?.map((vehicle: any) => {
      return {
        ...vehicle,
        daily_rent_price: Number(vehicle.daily_rent_price),
      };
    });
  }
  return modifiedResult;
};

export default castDailyRentPriceStringToNumber;
