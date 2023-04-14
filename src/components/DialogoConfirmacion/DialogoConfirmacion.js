import { IonAlert, IonButton } from "@ionic/react";
import { useEffect, useState } from "react";

export default function DialogoConfirmacion({
  titulo,
  contenido,
  abrirCerrarModal,
  handleclickCancelar,
  handleclickConfirmar,
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
    let variante = "";
    switch (color) {
      case "verde":
        variante = "success";
        break;
      case "rojo":
        variante = "danger";
        break;
      case "amarillo":
        variante = "warning";
        break;
      default:
        variante = "primary";
        break;
    }
    return variante;
  };

  const CargarBotones = () => {
    setBotonSi({
      texto: textoBotonSi,
      clase: getColor(colorBotonSi),
    });
    setBotonSi({
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
          handler: handleclickCancelar,
          // cssClass: botonNo.clase,
        },
        {
          text: botonNo.texto,
          role: "accept",
          handler: handleclickConfirmar,
          // cssClass: botonNo.clase,
        },
      ]}
      onDidDismiss={({ detail }) => console.log(detail)}
    />
  );
}
