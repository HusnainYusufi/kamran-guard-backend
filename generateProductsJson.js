const xlsx = require('xlsx');
const fs = require('fs');

// ----- Mapping Definitions -----
// Map manufacturer names to vendor _ids (adjust these as per your data)
const vendorMap = {
  "HONDA": "67d4eadd56e16add33f043fb",
  "TOYOTA": "67d4eadd56e16add33f043fd",
  "SUZUKI": "67d4eadd56e16add33f043ff",
  "KIA": "67d4eadd56e16add33f04401",
  "MG": "67d4eadd56e16add33f04403",
  "GLORY": "67d4eadd56e16add33f04405",
  "CHANGAN": "67d4eadd56e16add33f04407",
  "HAVAL": "67d4eadd56e16add33f04409",
  "HYUNDAI": "67d4eadd56e16add33f0440b",
  "HINO": "67d4eadd56e16add33f0440d",
  "DAIHATSU": "67d4eadd56e16add33f0440f",
  "MITSUBISHI": "67d4eadd56e16add33f04411",
  "FAW": "67d4eadd56e16add33f04413",
  "ISUZU": "67d4eadd56e16add33f04415",
  "JAC": "67d4eadd56e16add33f04417",
  "DATSUN": "67d4eadd56e16add33f04419",
  "UD NISSAN": "67d4eadd56e16add33f0441b",
  "UNIVERSAL": "67d4eadd56e16add33f0441d"
};

// Map category names to category _ids
const categoryMap = {
  "AIR FILTER": "67d4eb4756e16add33f04441",
  "BATTERY WATER": "67d4eb4756e16add33f04443",
  "BRAKE OIL": "67d4eb4756e16add33f04445",
  "COOLANT": "67d4eb4756e16add33f04447",
  "DISC PADS": "67d4eb4756e16add33f04449",
  "FUEL FILTER": "67d4eb4756e16add33f0444b",
  "GREASE": "67d4eb4756e16add33f0444d",
  "LEATHER": "67d4eb4756e16add33f0444f",
  "LUBE OIL": "67d4eb4756e16add33f04451",
  "OIL FILTER": "67d4eb4756e16add33f04453",
  "PHALA": "67d4eb4756e16add33f04455",
  "STEARING FILTER": "67d4eb4756e16add33f04457"
};

// ----- Read XLS File -----
// Use xlsx to read Export.xls (make sure your file is in the same directory)
const workbook = xlsx.readFile('Export.xls');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet);

// ----- Transform Rows to Product Objects -----
const products = rows.map(row => {
  // Convert each field to a string if needed before trimming
  const productName = row.ProductName ? String(row.ProductName).trim() : "";
  const code = row.Code ? String(row.Code).trim() : "";
  const categoryName = row.Category ? String(row.Category).trim() : "";
  const manufacturer = row.Menufacturer ? String(row.Menufacturer).trim() : ""; // Ensure column name matches (Menufacturer)
  const formula = row.Formula ? String(row.Formula).trim() : "";
  const salePrice = row.SalePrice ? parseFloat(row.SalePrice) : 0;
  const purchasePrice = row.PurchasePrice ? parseFloat(row.PurchasePrice) : 0;

  return {
    name: productName,
    partNumber: code,
    category: categoryMap[categoryName] || null,
    vendor: vendorMap[manufacturer] || null,
    formula: formula,
    salePrice: salePrice,
    purchasePrice: purchasePrice,
    initialQuantity: 0
  };
});

// ----- Write JSON Array to File -----
fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
console.log("Generated products.json with " + products.length + " products.");
