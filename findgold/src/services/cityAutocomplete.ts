export async function fetchCitySuggestions(query: string): Promise<string[]> {
  if (query.length < 2) return [];
  const url = `https://secure.geonames.org/searchJSON?name_startsWith=${encodeURIComponent(query)}&country=FR&featureClass=P&maxRows=5&username=demo`;
  // Remplacer "demo" par ton username GeoNames si tu en as un
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.geonames || []).map((city: any) => city.name + (city.adminName1 ? ` (${city.adminName1})` : ''));
}
