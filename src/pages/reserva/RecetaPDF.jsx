import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Roboto',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    borderBottom: 2,
    borderBottomColor: '#0066cc',
    paddingBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
  doctorInfo: {
    marginLeft: 15,
    flex: 1,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  doctorCredentials: {
    fontSize: 14,
    color: '#0066cc',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#0066cc',
    borderBottom: 1,
    borderBottomColor: '#0066cc',
    paddingBottom: 2,
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  infoItem: {
    width: '33%',
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: '#666',
  },
  value: {
    fontSize: 12,
    fontWeight: 'medium',
  },
  prescriptionArea: {
    borderWidth: 1,
    borderColor: '#0066cc',
    padding: 10,
    minHeight: 150,
    marginTop: 10,
  },
  prescriptionText: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    opacity: 0.1,
    width: 300,
    height: 300,
  },
});

const InfoItem = ({ label, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || 'N/A'}</Text>
  </View>
);

export default function PrescriptionPDF({
  doctorName,
  doctorCredentials,
  patientName,
  patientAge,
  patientPhone,
  date,
  weight,
  height,
  fc,
  fr,
  temp,
  logoUrl,
  prescriptionText,
  diagnosis,
  physicalExam,
  consultReason
}) {
  return (
    <Document>
      <Page size={{ width: 396, height: 612 }} style={styles.page}>
        <View style={styles.header}>
          <Image src={logoUrl} style={styles.logo} />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctorName}</Text>
            <Text style={styles.doctorCredentials}>{doctorCredentials}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Información del Paciente</Text>
        <View style={styles.infoGrid}>
          <InfoItem label="Paciente" value={patientName} />
          <InfoItem label="Edad" value={patientAge} />
          <InfoItem label="Teléfono" value={patientPhone} />
          <InfoItem label="Fecha" value={date} />
        </View>



        <Text style={styles.sectionTitle}>Receta</Text>
        <View style={styles.prescriptionArea}>
          <Text style={styles.prescriptionText}>{prescriptionText}</Text>
        </View>

        <View style={styles.footer}>
          <Text>Firma Medico</Text>
          <Text>{doctorName}</Text>
        </View>

        <Image src={logoUrl} style={styles.watermark} />
      </Page>
    </Document>
  );
}