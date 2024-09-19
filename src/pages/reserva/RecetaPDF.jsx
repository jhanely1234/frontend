import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, Svg, Path } from '@react-pdf/renderer';

// Register custom fonts
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
  },
  logo: {
    width: 50,
    height: 50,
  },
  doctorInfo: {
    marginLeft: 10,
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
  patientInfo: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: '#0066cc',
    marginRight: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#0066cc',
    fontSize: 12,
    paddingBottom: 2,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  watermark: {
    position: 'absolute',
    top: 200,
    left: 100,
    opacity: 0.1,
    width: 300,
    height: 300,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#0066cc',
  },
  waves: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  prescriptionArea: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0066cc',
    marginBottom: 20,
    padding: 10,
  },
});

const PrescriptionPDF = ({ 
  doctorName, 
  doctorCredentials, 
  patientName, 
  patientAge, 
  date, 
  weight, 
  fc, 
  fr, 
  ta, 
  temp,
  logoUrl,
  prescriptionText
}) => (
  <Document>
    <Page size="A5" style={styles.page}>
      <View style={styles.header}>
        <Svg width="50" height="50" viewBox="0 0 50 50">
          <Path
            d="M25 0C11.2 0 0 11.2 0 25s11.2 25 25 25 25-11.2 25-25S38.8 0 25 0zm0 45c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z"
            fill="#0066cc"
          />
          <Path
            d="M35 15H25v10h-5v10h5v10h10V35h5V25h-5z"
            fill="#0066cc"
          />
        </Svg>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{doctorName}</Text>
          <Text style={styles.doctorCredentials}>{doctorCredentials}</Text>
        </View>
      </View>

      <View style={styles.patientInfo}>
        <View style={styles.row}>
          <Text style={styles.label}>Paciente:</Text>
          <Text style={styles.input}>{patientName}</Text>
        </View>
        <View style={styles.row}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Text style={styles.label}>Edad:</Text>
            <Text style={styles.input}>{patientAge}</Text>
          </View>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.input}>{date}</Text>
          </View>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Text style={styles.label}>Peso:</Text>
            <Text style={styles.input}>{weight}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Text style={styles.label}>F.C.</Text>
            <Text style={styles.input}>{fc}</Text>
          </View>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Text style={styles.label}>F.R.</Text>
            <Text style={styles.input}>{fr}</Text>
          </View>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Text style={styles.label}>T.A.</Text>
            <Text style={styles.input}>{ta}</Text>
          </View>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Text style={styles.label}>TEMP.</Text>
            <Text style={styles.input}>{temp}</Text>
          </View>
        </View>
      </View>

      <View style={styles.prescriptionArea}>
        <Text>{prescriptionText}</Text>
      </View>

      <Image src={logoUrl} style={styles.watermark} />

      <View style={styles.footer}>
        <Text>Calle Cualquiera 123, Cualquier Lugar | (55) 1234-5678</Text>
        <Text>hola@sitioincreible.com | @sitioincreible</Text>
      </View>

      <Svg style={styles.waves} width="100%" height="50" viewBox="0 0 1440 320">
        <Path
          fill="#e6f2ff"
          fillOpacity="1"
          d="M0,32L48,37.3C96,43,192,53,288,80C384,107,480,149,576,154.7C672,160,768,128,864,112C960,96,1056,96,1152,101.3C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </Svg>
    </Page>
  </Document>
);

export default PrescriptionPDF;