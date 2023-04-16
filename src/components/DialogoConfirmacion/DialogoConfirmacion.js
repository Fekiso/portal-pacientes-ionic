import { IonAlert, IonButton } from "@ionic/react";
import { useEffect, useState } from "react";
import "./DialogoConfirmacion.css";
export default function DialogoConfirmacion({
  titulo,
  contenido,
  abrirCerrarModal,
  handleclickBotonNo,
  handleclickBotonSi,
  colorBotonNo,
  colorBotonSi,
  textoBotonNo,
  textoBotonSi,
}) {
  const [botonSi, setBotonSi] = useState({
    texto: "",
    clase: "",
    metodoOnClik: null,
  });
  const [botonNo, setBotonNo] = useState({
    texto: "",
    clase: "",
    metodoOnClik: null,
  });

  const getColor = (color) => {
    switch (color) {
      case "verde":
        return "success";
      case "rojo":
        return "danger";
      case "amarillo":
        return "warning";
      default:
        return "primary";
    }
  };

  const CargarBotones = () => {
    setBotonSi({
      texto: textoBotonSi,
      clase: getColor(colorBotonSi),
    });
    setBotonNo({
      texto: textoBotonNo,
      clase: getColor(colorBotonNo),
    });
  };

  useEffect(() => {
    CargarBotones();
  }, []);

  return (
    <IonAlert
      header={titulo}
      message={contenido}
      isOpen={abrirCerrarModal}
      className="custom-alert"
      buttons={[
        {
          text: botonNo.texto,
          role: "cancel",
          handler: handleclickBotonNo,
          cssClass: botonNo.clase,
        },
        {
          text: botonSi.texto,
          role: "accept",
          handler: handleclickBotonSi,
          cssClass: botonSi.clase,
        },
      ]}
      onDidDismiss={({ detail }) => console.log(detail)}
    />
  );
}
