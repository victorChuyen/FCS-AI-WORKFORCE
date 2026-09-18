import AdmZip from 'adm-zip';
import fs from 'fs';

const zipPath = 'D:/FCS-AI-WORKFORCE/THÔNG TIN LAO ĐỘNG FOXCONN FCS.xlsx/THÔNG TIN LAO ĐỘNG FCS.zip';
if (fs.existsSync(zipPath)) {
  console.log('Zip file exists. Size:', fs.statSync(zipPath).size);
}
