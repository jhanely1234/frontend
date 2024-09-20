import React from 'react'

export default function UpdatedHospitalWelcome() {
  const hospitalInfo = {
    name: "Clinica MediConsulta",
    founded: 2019,
    mission: "Brindar atención médica de calidad con compasión y excelencia.",
    specialties: [
      { name: "Cardiología", image: "/public/Cardiologia.jpg" },
      { name: "Neurología", image: "/public/Neurologia.jpeg" },
      { name: "Pediatría", image: "/public/Pediatria-1024x683.jpg" },
      { name: "Oncología", image: "/public/doctora-oncologia.jpg" },
      { name: "Medicina General", image: "/public/medigeneral.jpg" },
    ],
  }

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      color: '#333',
      lineHeight: 1.6,
      backgroundColor: '#f0f8ff', // Light blue background
    }}>
      <header style={{ 
        marginBottom: '40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/public/logo_mediconsulta_original.png" 
            alt="Logo de Clinica MediConsulta" 
            style={{ marginRight: '20px', width: '50px', height: '50px' }}
          />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0056b3' }}>{hospitalInfo.name}</h1>
        </div>
      </header>

      <main>
        <section style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          backgroundColor: '#ffffff',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0056b3', marginBottom: '16px' }}>
            Bienvenido a su centro de salud integral
          </h2>
          <p style={{ fontSize: '16px', color: '#4a4a4a', maxWidth: '800px', margin: '0 auto' }}>
            Desde {hospitalInfo.founded}, {hospitalInfo.name} ha estado comprometido con {hospitalInfo.mission}
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0056b3', marginBottom: '20px', textAlign: 'center' }}>
            Nuestras Especialidades
          </h3>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '20px', 
            justifyContent: 'center'
          }}>
            {hospitalInfo.specialties.map((specialty, index) => (
              <div key={index} style={{
                padding: '20px',
                background: '#ffffff',
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '200px'
              }}>
                <img 
                  src={specialty.image} 
                  alt={`Ícono de ${specialty.name}`} 
                  style={{ width: '80px', height: '80px', marginBottom: '10px' }}
                />
                <span style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#0056b3'
                }}>
                  {specialty.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0056b3', marginBottom: '20px', textAlign: 'center' }}>
            Nuestra Ubicación
          </h3>
          <div style={{
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1003.2181956110715!2d-66.28254633017828!3d-17.39314331968396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93e30b77af10fe31%3A0x481967dab56c2581!2sJP49%2BP73%2C%20Quillacollo!5e0!3m2!1ses-419!2sbo!4v1726806139378!5m2!1ses-419!2sbo" 
              width="100%" 
              height="450" 
              style={{border:0}} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>
      </main>
    </div>
  )
}