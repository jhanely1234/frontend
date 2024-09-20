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
    padding: 40,
    fontFamily: 'Roboto',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 700,
    color: '#1e3a8a',
  },
  subtitle: {
    fontSize: 48,
    fontWeight: 700,
    color: '#1e3a8a',
    marginTop: -10,
  },
  logo: {
    width: 100,
    height: 100,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoColumn: {
    flexDirection: 'column',
    width: '48%',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: '#1e3a8a',
    width: '40%',
  },
  value: {
    fontSize: 12,
    borderBottom: 1,
    borderColor: '#1e3a8a',
    flex: 1,
  },
  table: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#1e3a8a',
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#1e3a8a',
  },
  tableHeader: {
    backgroundColor: '#e2e8f0',
    fontWeight: 700,
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
    textAlign: 'left',
    flex: 1,
    borderRightWidth: 1,
    borderColor: '#1e3a8a',
  },
  notesSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notes: {
    width: '65%',
    borderWidth: 1,
    borderColor: '#1e3a8a',
    padding: 10,
    backgroundColor: '#e2e8f0',
  },
  allergies: {
    width: '30%',
    borderWidth: 1,
    borderColor: '#1e3a8a',
    padding: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e3a8a',
    marginBottom: 5,
  },
});

const HistorialMedicoPDF = ({ paciente, historial }) => {
  const latestConsulta = historial.consultas[0];
  const sortedConsultas = [...historial.consultas].sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Historial</Text>
            <Text style={styles.subtitle}>Medico</Text>
          </View>
          <Image style={styles.logo} src="/public/logo_mediconsulta_original.png" />
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>PACIENTE</Text>
              <Text style={styles.value}>{paciente.name} {paciente.lastname}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>EMAIL</Text>
              <Text style={styles.value}>{paciente.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>PESO</Text>
              <Text style={styles.value}>{latestConsulta?.signos_vitales[0]?.peso || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>TALLA</Text>
              <Text style={styles.value}>{latestConsulta?.signos_vitales[0]?.talla || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.infoColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>DOCTOR</Text>
              <Text style={styles.value}>{latestConsulta?.citaMedica.medico.name} {latestConsulta?.citaMedica.medico.lastname}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>TEMPERATURA</Text>
              <Text style={styles.value}>{latestConsulta?.signos_vitales[0]?.Temperatura || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>SIGNOS VITALES</Text>
              <Text style={styles.value}>{latestConsulta?.signos_vitales[0]?.Fc || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>FRECUENCIA RESPIRATORIA</Text>
              <Text style={styles.value}>{latestConsulta?.signos_vitales[0]?.Fr || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>DIA</Text>
            <Text style={styles.tableCell}>ESPECIALIDAD</Text>
            <Text style={styles.tableCell}>DIAGNOSTICO</Text>
          </View>
          {sortedConsultas.map((consulta, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{new Date(consulta.fechaHora).toLocaleDateString()}</Text>
              <Text style={styles.tableCell}>{consulta.citaMedica.especialidad_solicitada.name}</Text>
              <Text style={styles.tableCell}>{consulta.diagnostico || 'N/A'}</Text>
            </View>
          ))}
        </View>

        <View style={styles.notesSection}>
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>Ultima Nota Medica</Text>
            <Text>{latestConsulta?.motivo_consulta || 'Notas Medicas no disponibles.'}</Text>
          </View>
          <View style={styles.allergies}>
            <Text style={styles.sectionTitle}>Ultima Prescripcion</Text>
            <Text>{latestConsulta?.receta || 'Prescripcion no disponilbe.'}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default HistorialMedicoPDF;