"use client";

export default function SepeteEkle({ urun }: any) {
  const sepeteEkle = () => {
    let mevcutSepet: any[] = [];

    try {
      const kayitliSepet = localStorage.getItem("sepet");
      const cozulmusSepet = kayitliSepet ? JSON.parse(kayitliSepet) : [];

      mevcutSepet = Array.isArray(cozulmusSepet) ? cozulmusSepet : [];
    } catch {
      mevcutSepet = [];
    }

    const sepettekiUrun = mevcutSepet.find((item) => item.id === urun.id);

    if (sepettekiUrun) {
      sepettekiUrun.adet = (sepettekiUrun.adet || 1) + 1;
    } else {
      mevcutSepet.push({ ...urun, adet: 1 });
    }

    localStorage.setItem("sepet", JSON.stringify(mevcutSepet));

    alert("Ürün sepete eklendi");
  };

  return (
    <button
      onClick={sepeteEkle}
      style={{
        marginTop: 20,
        padding: "14px 20px",
        border: "none",
        background: "black",
        color: "white",
        borderRadius: 10,
        cursor: "pointer",
        fontSize: 16,
      }}
    >
      Sepete Ekle
    </button>
  );
}
