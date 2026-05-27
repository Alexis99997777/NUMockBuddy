export type ATSInfo = {
  ats: string;
  note: string;
};

//ts 工具类型 格式的映射

export const ATS_MAP: Record<string, ATSInfo> = {
  "google": { ats: "Greenhouse", note: "Greenhouse parses multi-column layouts poorly — use single column." },
  "microsoft": { ats: "Workday", note: "Workday struggles with tables and text boxes — avoid them." },
  "amazon": { ats: "Internal (KNET)", note: "Amazon's internal ATS is sensitive to non-standard section headers." },
  "apple": { ats: "Workday", note: "Workday strips formatting — keep bullets simple." },
  "meta": { ats: "Workday", note: "Workday drops content in text boxes — use plain text only." },
  "netflix": { ats: "Lever", note: "Lever handles PDFs well but dislikes fancy fonts." },
  "salesforce": { ats: "Workday", note: "Workday can mangle two-column layouts." },
  "uber": { ats: "Greenhouse", note: "Greenhouse may skip bullets using special characters." },
  "lyft": { ats: "Greenhouse", note: "Greenhouse strips non-standard bullet symbols." },
  "airbnb": { ats: "Greenhouse", note: "Greenhouse handles standard single-column PDFs best." },
  "stripe": { ats: "Greenhouse", note: "Greenhouse: avoid headers/footers with contact info." },
  "twitter": { ats: "Greenhouse", note: "Greenhouse works best with clean single-column PDFs." },
  "x": { ats: "Greenhouse", note: "Greenhouse works best with clean single-column PDFs." },
  "linkedin": { ats: "Internal (Glint)", note: "Keep format clean and ATS-standard." },
  "adobe": { ats: "Workday", note: "Workday cannot parse image-based or scanned PDFs." },
  "oracle": { ats: "Taleo", note: "Taleo is one of the strictest — avoid tables, images, and columns." },
  "ibm": { ats: "Kenexa", note: "Kenexa truncates long bullets — keep each under 2 lines." },
  "jpmorgan": { ats: "Workday", note: "Contact info in headers/footers often gets dropped." },
  "jp morgan": { ats: "Workday", note: "Contact info in headers/footers often gets dropped." },
  "goldman sachs": { ats: "Taleo", note: "Taleo is strict about standard section names." },
  "morgan stanley": { ats: "Taleo", note: "Taleo parses plain text resumes most reliably." },
  "deloitte": { ats: "Workday", note: "Keep section headers simple — avoid stylized fonts." },
  "mckinsey": { ats: "Custom Portal", note: "Single column PDF recommended." },
  "accenture": { ats: "Workday", note: "Workday cannot read text in images or text boxes." },
  "pwc": { ats: "Taleo", note: "Use standard date format MM/YYYY for best parsing." },
  "ey": { ats: "Taleo", note: "Taleo often misreads dates not in MM/YYYY." },
  "kpmg": { ats: "Taleo", note: "Works best with Arial or Times New Roman." },
  "boeing": { ats: "Taleo", note: "No tables, columns, or special characters." },
  "tesla": { ats: "Greenhouse", note: "Avoid columns and embedded links in headers." },
  "nvidia": { ats: "Workday", note: "Workday strips text inside tables." },
  "intel": { ats: "Workday", note: "Avoid abbreviations for section names." },
  "cisco": { ats: "Workday", note: "Workday can miss skills listed in a sidebar." },
  "atlassian": { ats: "Greenhouse", note: "Greenhouse reads clean PDFs reliably." },
  "shopify": { ats: "Lever", note: "Lever handles modern PDFs well — avoid text boxes." },
  "dropbox": { ats: "Greenhouse", note: "Avoid special Unicode bullet symbols." },
  "palantir": { ats: "Lever", note: "Lever is lenient but still prefers single-column." },
  "snowflake": { ats: "Workday", note: "Parses best when dates are in a consistent format." },
  "databricks": { ats: "Greenhouse", note: "Keep contact info in the body, not header/footer." },
  "wayfair": { ats: "Greenhouse", note: "Greenhouse: standard PDF, no fancy formatting." },
  "hubspot": { ats: "Greenhouse", note: "Greenhouse reads clean single-column PDFs reliably." },
};

//给一个公司名 返回信息
export function lookupATS(companyName: string): ATSInfo | null {
  //去给格式修改
  const key = companyName.toLowerCase().trim();
  //去字典里查 如果没有 ？？ 就返回null
  return ATS_MAP[key] ?? null;
}
