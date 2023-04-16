import { IonToast } from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import "./CustomToast.css";
function CustomToast({ openToast, onDidDismiss, message, colorNotificacion }) {
  const [color, setColor] = useState("");

  const getColor = () => {
    switch (colorNotificacion) {
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

  useEffect(() => {
    if (openToast) setColor(getColor());
  }, [openToast]);

  return (
    <IonToast
      isOpen={openToast}
      onDidDismiss={onDidDismiss}
      message={message}
      duration={5000}
      position="top"
      className={`${color}`}
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
