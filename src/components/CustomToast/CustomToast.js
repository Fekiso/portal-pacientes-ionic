import { IonToast } from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import './CustomToast.css'
function CustomToast({ openToast, onDidDismiss, message, tipo }) {
  const [color, setColor] = useState("");
  
  const getColor = () => {
    let variante = "";
    switch (tipo) {
      case "verde":
        variante = "success";
        break;
      case "rojo":
        variante = "danger";
        break;
      case "amarrillo":
        variante = "warning";
        break;
      default:
        variante = "primary";
        break;
    }
    setColor(variante);
  };

  useEffect(() => {
    getColor();
  }, []);

  return (
    <IonToast
      isOpen={openToast}
      onDidDismiss={onDidDismiss}
      message={message}
      duration={5000}
      color={color}
      position='top'
      class="custom-toast"
      buttons={[
        {
          icon: closeOutline,
          role: "cancel",
          handler: () => {
            onDidDismiss();
          },
        },
      ]}
    />
  );
}

export default CustomToast;
