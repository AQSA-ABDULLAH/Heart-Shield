import React from "react";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer"; // 🆕 Import Image

// --- PDF STYLES ---
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: "#ffffff", color: "#333" },
  header: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 2, borderBottomColor: "#f3f4f6", paddingBottom: 20, marginBottom: 20 },
  logoSection: { flexDirection: "column" },
  logoText: { fontSize: 26, fontWeight: "bold", color: "#dc2626" },
  subLogoText: { fontSize: 10, color: "#6b7280", marginTop: 4 },
  reportDetails: { alignItems: "flex-end" },
  detailText: { fontSize: 10, color: "#6b7280", marginBottom: 2 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#111827", marginBottom: 10, marginTop: 20, textTransform: "uppercase" },
  card: { backgroundColor: "#f9fafb", borderRadius: 6, padding: 15, marginBottom: 10 },
  row: { flexDirection: "row", marginBottom: 8, alignItems: "center" },
  predictionRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  label: { width: 120, fontSize: 10, color: "#6b7280", fontWeight: "bold" },
  value: { flex: 1, fontSize: 10, color: "#111827" },
  riskBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4, alignSelf: "flex-start", marginTop: 5, marginBottom: 10 },
  riskText: { fontSize: 12, fontWeight: "bold" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 10 },
  disclaimer: { fontSize: 8, color: "#9ca3af" },
  
  // 🆕 Image Styles
  imageContainer: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    padding: 10,
    height: 200, // Fixed height to prevent layout break
  },
  ecgImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  }
});

const HeartShieldReportPDF = ({ data }) => {
  const isHighRisk = data.risk === "High Risk";
  const badgeBg = isHighRisk ? "#fee2e2" : "#dcfce7";
  const badgeColor = isHighRisk ? "#991b1b" : "#166534";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Text style={styles.logoText}>HeartShield</Text>
            <Text style={styles.subLogoText}>AI-Powered Cardiac Analysis</Text>
          </View>
          <View style={styles.reportDetails}>
            <Text style={styles.detailText}>Report ID: {data.id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.detailText}>Date: {data.date}</Text>
            <Text style={styles.detailText}>Time: {data.time}</Text>
          </View>
        </View>

        {/* STATUS SECTION */}
        <Text style={styles.sectionTitle}>Consultation Status</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Doctor Status:</Text>
            <Text style={styles.value}>{data.consultationStatus}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Analysis Status:</Text>
            <Text style={styles.value}>Completed</Text>
          </View>
        </View>

        {/* 🆕 ECG IMAGE SECTION 

[Image of typical ECG waveform]
 */}
        <Text style={styles.sectionTitle}>ECG Visualization</Text>
        {data.ecgImage ? (
          <View style={styles.imageContainer}>
             {/* Note: React-PDF requires valid URL or Base64 */}
             <Image 
               style={styles.ecgImage} 
               src={data.ecgImage} 
             />
          </View>
        ) : (
          <View style={[styles.card, { alignItems: 'center', padding: 20 }]}>
             <Text style={{ fontSize: 10, color: '#9ca3af' }}>ECG Image not available</Text>
          </View>
        )}

        {/* AI ANALYSIS RESULT SECTION */}
        <Text style={styles.sectionTitle}>AI Analysis Result</Text>
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: badgeColor }]}>
          
          <Text style={{ fontSize: 10, color: "#6b7280", marginBottom: 5 }}>Overall Assessment</Text>
          <View style={[styles.riskBadge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.riskText, { color: badgeColor }]}>{data.risk.toUpperCase()}</Text>
          </View>

          <View style={{ marginTop: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 10, color: "#111827", fontWeight: "bold", marginBottom: 5 }}>
              Detailed Probability Analysis:
            </Text>

            {data.aiPredictions && data.aiPredictions.length > 0 ? (
              data.aiPredictions.map((item, index) => (
                <View key={index} style={styles.predictionRow}>
                  <Text style={{ fontSize: 10, color: "#6b7280" }}>{item.label}</Text>
                  <Text style={{ fontSize: 10, fontWeight: "bold", color: "#111827" }}>{item.value}</Text>
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 10, color: "#9ca3af" }}>No detailed probabilities available.</Text>
            )}

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingTop: 8 }}>
                <Text style={{ fontSize: 10, color: "#374151", fontWeight: "bold" }}>
                    Total Overall Risk Score
                </Text>
                <Text style={{ fontSize: 11, fontWeight: "bold", color: isHighRisk ? "#dc2626" : "#166534" }}>
                    {data.overallRiskValue}
                </Text>
            </View>
          </View>

          <Text style={{ fontSize: 10, marginTop: 5, color: "#374151", lineHeight: 1.4 }}>
            {isHighRisk
              ? "The AI analysis suggests a high probability of cardiac irregularities. Immediate consultation is recommended."
              : "The AI analysis suggests the ECG is within normal parameters."}
          </Text>
        </View>

        {/* PRESCRIPTION SECTION */}
        {data.prescriptionText ? (
          <>
            <Text style={styles.sectionTitle}>Doctor's Prescription</Text>
            <View style={styles.card}>
              <Text style={{ fontSize: 11, lineHeight: 1.5 }}>{data.prescriptionText}</Text>
            </View>
          </>
        ) : (
          <View style={{ marginTop: 20, padding: 20, borderStyle: "dashed", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6 }}>
            <Text style={{ fontSize: 10, color: "#9ca3af", textAlign: "center" }}>No prescription added by doctor yet.</Text>
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.disclaimer}>
            Generated by HeartShield AI. This report is for informational purposes only. Always consult with a certified cardiologist.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default HeartShieldReportPDF;