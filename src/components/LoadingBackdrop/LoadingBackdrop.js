import { IonBackdrop, IonSpinner } from "@ionic/react";
import "./LoadingBackdrop.css";

const LoadingBackdrop = (visualizar) => {
  return (
    <>
      <IonBackdrop visible={visualizar} />
      <div id="box">
        <IonSpinner name="crescent" />
      </div>
    </>
  );
};

export default LoadingBackdrop;
