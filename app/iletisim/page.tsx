export default function IletisimPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "350px",
          backgroundColor: "white",
          padding: 30,
          borderRadius: 10,
          boxShadow: "0 0 15px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: 20 }}>İletişim</h1>

        <div style={{ fontSize: 16, lineHeight: 2 }}>
          <b>Adres:</b>
          <br />
          Ankara / Türkiye
          <br />
          <br />
          <b>Telefon:</b>
          <br />
          0555 555 55 55
        </div>
      </div>
    </div>
  );
}
