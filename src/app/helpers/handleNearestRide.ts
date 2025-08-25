import {
  IPickupAndDropoffLocation,
  IRide,
} from "../modules/ride/ride.interface";

function getDistanceKm(
  loc1: IPickupAndDropoffLocation,
  loc2: IPickupAndDropoffLocation
): number {
  if (!loc2.latitude || !loc2.longitude) {
    return 0;
  }
  const R = 6371; // Radius of Earth in km
  const dLat =
    (Number(loc2.latitude) - Number(loc1.latitude)) * (Math.PI / 180);
  const dLon =
    (Number(loc2.longitude) - Number(loc1.longitude)) * (Math.PI / 180);

  const lat1 = Number(loc1.latitude) * (Math.PI / 180);
  const lat2 = Number(loc2.latitude) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}

// Main function to get top 10 nearest
function getNearestLocations(
  myLocation: IPickupAndDropoffLocation,
  otherLocations: IRide[],
  limit = 10
) {
  return otherLocations
    .map((loc) => ({
      ...loc,
      distance: getDistanceKm(
        myLocation,
        loc.pickupLocation as IPickupAndDropoffLocation
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}
export default getNearestLocations;
