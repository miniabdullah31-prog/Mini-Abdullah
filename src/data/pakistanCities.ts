/** Common Pakistan cities for Aladhan prayer-time lookup (country=Pakistan on backend). */
export const PAKISTAN_CITIES: string[] = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Sialkot",
  "Gujranwala",
  "Bahawalpur",
  "Sargodha",
  "Sukkur",
  "Larkana",
  "Sheikhupura",
  "Jhang",
  "Rahim Yar Khan",
  "Gujrat",
  "Mardan",
  "Kasur",
  "Okara",
  "Sahiwal",
  "Abbottabad",
  "Mirpur",
  "Muzaffarabad",
  "Gwadar",
  "Turbat",
  "Dera Ghazi Khan",
  "Nawabshah",
  "Mingora",
  "Chiniot",
  "Kamoke",
  "Hafizabad",
  "Kohat",
  "Jacobabad",
  "Shikarpur",
  "Khanewal",
  "Dadu",
  "Goijra",
];

export function filterCities(query: string): string[] {
  const q = String(query || "")
    .trim()
    .toLowerCase();
  if (!q) return PAKISTAN_CITIES;
  return PAKISTAN_CITIES.filter((city) => city.toLowerCase().includes(q));
}
