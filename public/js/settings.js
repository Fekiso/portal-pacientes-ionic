localStorage.setItem("nombreClinica", "Clinica del Sol");
localStorage.setItem("tituloWeb", "Portal Pacientes - Clinica del Sol");
localStorage.setItem("tituloMainPage", "Pagina principal - turnero web");

//variable para usuario logueado
localStorage.setItem("ppUL", {});
//variable con url api
localStorage.setItem("urlAxio", "http://martel.no-ip.info:8080/api/v2/");
//localStorage.setItem("urlAxio", "http://martel.no-ip.info:8950/api/v2/");
Array.prototype.unicos = function () {
  return this.filter((valor, indice) => {
    return this.indexOf(valor) === indice;
  });
};

Array.prototype.getPropiedadesArray = function () {
  let array = this.map((item) => Object.keys(item));
  if (array.length > 1) {
    array = array.filter((array, indice, arrayPrincipal) => {
      return (
        indice ===
        arrayPrincipal.findIndex((otroArray) => {
          return JSON.stringify(otroArray) === JSON.stringify(array);
        })
      );
    });
  }

  return array;
};

Array.prototype.removeDuplicates = (originalArray, prop)=> {
  /*Ejemplo de uso */
  // var arrayConDuplicados = [{id: 1, name: 'Juan'},{id: 2, name: 'Pedro'},{id: 3, name: 'Juan'}];
  // var arraySinDuplicados = removeDuplicates(arrayConDuplicados, 'name');

  var newArray = [];
  var lookupObject  = {};

  for(var i in originalArray) {
    lookupObject[originalArray[i][prop]] = originalArray[i];
  }

  for(i in lookupObject) {
    newArray.push(lookupObject[i]);
  }
  return newArray;}
