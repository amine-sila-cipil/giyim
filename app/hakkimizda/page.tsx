export default function Page() {
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
          maxWidth: "700px",
          backgroundColor: "white",
          padding: 30,
          borderRadius: 10,
          boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 20 }}>Hakkımızda</h1>

        <p>YILMAZLAR GİYİM kaliteli ve modern giyim ürünleri sunar.</p>

        <p>Amacımız uygun fiyatlı ve güvenli alışveriş sağlamaktır.</p>

        <div style={{ marginTop: 20, textAlign: "center", color: "red" }}>
          Güvenli Alışveriş - Kaliteli Ürün - Hızlı Teslimat
        </div>
      </div>
    </div>
  );
}
