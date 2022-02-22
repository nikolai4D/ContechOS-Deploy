import Actions from "../store/Actions.js";
import dropDown from "./DropDownField.js";
import inputField from "./InputField.js";
import getDefType from "./graphfunctions/getDefType.js";

let definitions = "";

export function FormCreate(event, d, clickedObj) {
  // Getting definitions
  let fieldsArray = [];

  definitions = JSON.parse(sessionStorage.getItem("definitions"))[0];
  const defId = parseInt(d.target.attributes.getNamedItem("data-defid").value);
  const defTypeId = parseInt(
    d.target.attributes.getNamedItem("data-deftypeid").value
  );
  const defType = getDefType(defId, defTypeId);
  const { fieldTypes, fieldProperties } = definitions.fields;

  // initialise array to put fields into

  let defTypeAttributes = defType.attributes;

  for (let attribute of defTypeAttributes) {
    //   // for attribute in attributes,  get the key and the value. If the value is "hidden", skip it all together.
    //TODO :

    // Check what attribute defid/deftypeid, check if is dependent on parentId, get parentId by clickedObj, get attribute+s from parentId. These are the keys. THEN, for the keys, get values.
    // Later, look 

    let keyOfAttribute = Object.keys(attribute)[0];
    let valueOfAttribute = Object.values(attribute)[0];
    let fieldTypeId = valueOfAttribute.fieldTypeId;
    let fieldType = fieldTypes.find(obj => obj.fieldTypeId === fieldTypeId).type;

    let fieldPropertiesOfAttribute = getFieldProperties(valueOfAttribute, fieldProperties);
    if (fieldPropertiesOfAttribute.some(obj => obj.type === 'hidden')) {
      continue;
    }

    if (fieldType === 'input') {
      createInput(fieldsArray, keyOfAttribute)
    }
    else if (fieldType === 'dropDown') {
      const { defId, defTypeId } = valueOfAttribute;
      createDropdown(fieldsArray, keyOfAttribute, getDefType(defId, defTypeId));
    }
    else if (fieldType === 'dropDownMultiple') {
      const { defId, defTypeId } = valueOfAttribute;
      createDropdownMultiple(fieldsArray, keyOfAttribute, getDefType(defId, defTypeId));
    }
    else if (fieldType === 'dropDownKeyValue') {

      createDropdownKeyValue(fieldsArray, valueOfAttribute, clickedObj, defType);
    }
    else if (fieldType === 'externalNodeClick') {
      let htmlString = `<div style="display: flex; padding: 0.5em">
      <label class="form-label" for="field_${keyOfAttribute}">${keyOfAttribute}:</label>
      <input type="text" id="field_${keyOfAttribute}" class="form-control" name="field_${keyOfAttribute}" disabled value="Click target node"><br>
  </div>`;
      fieldsArray.push(htmlString);
    }
  }

  const template = `
  <div class="formCreate position-absolute">
        <div><h3>create: ${defType.defTypeTitle}</h3></div>
        <div class="card">
        <div class="card-body">
           <form id="formCreate" >
             ${fieldsArray.join("")}
                <button type="submit" class="btn btn-primary formCreateSubmit" value="submit">Submit</button>
            </form>
        </div>
        </div>
    </div>
`;
  return template;
}

export function getDefTypeFromSessionStorage(defType) {
  const defTypeTitle = getDefType(defType.defId, defType.defTypeId).defTypeTitle;
  Actions.GETALL(defTypeTitle);
  return JSON.parse(sessionStorage.getItem(`${defTypeTitle}`));
};

const createInput = (fieldsArray, keyOfAttr) => {
  fieldsArray.push(inputField(keyOfAttr));
};

const createDropdown = (fieldsArray, keyOfAttribute, defType) => {
  let allNodesByDefType = getDefTypeFromSessionStorage(defType);

  let dropDownString = dropDown(keyOfAttribute, allNodesByDefType);
  fieldsArray.push(dropDownString);
}

const createDropdownMultiple = (fieldsArray, keyOfAttribute, defType) => {
  let allNodesByDefType = getDefTypeFromSessionStorage(defType);
  let dropDownString = dropDown(keyOfAttribute, allNodesByDefType, "multiple");
  fieldsArray.push(dropDownString);
}

const createDropdownKeyValue = (fieldsArray, valueOfAttribute, clickedObj, defType) => {
  let dropDownHtmlString = "";

  let allKeyIdsByParent = []
  let propsNodesRels = []
  if (defType.defTypeTitle === 'configObjInternalRel') {

    let configRels = JSON.parse(sessionStorage.getItem(`configs`))[0].rels;

    let parentConfigDefInternalRels = configRels.filter(rel => { return (rel.source === clickedObj.parentId && rel.target === clickedObj.parentId) })
    console.log(parentConfigDefInternalRels)

    let dropDownString = dropDown("configDefInternalRel", parentConfigDefInternalRels);
    fieldsArray.push(dropDownString);
    fieldsArray.push(`<div id="field_filteredProps" name="field_filteredProps"></div>`);

    // propsNodesRels = JSON.parse(sessionStorage.getItem(`configs`))[0].rels;
    // let configDefRels = propsNodesRels.filter(rel => { return rel.defTypeTitle === 'configDefInternalRel' })
    // let ListWithPropKeys = configDefRels.f(obj => { return obj.propKeys })

    // console.log(ListWithPropKeys)

    // propsNodes = JSON.parse(sessionStorage.getItem(`props`))[0].nodes;

    // let allKeysByParent = propsNodes.filter(node => { return configDefRels.includes(node.id) })

  }
  else if (defType.defTypeTitle === 'configObjExternaRel') {
    propsNodesRels = JSON.parse(sessionStorage.getItem(`configs`))[0].rels;
    let configDefRels = propsNodesRels.filter(rel => { return rel.defTypeTitle === 'configDefExternalRel' })
  }

  else if (clickedObj.defTypeTitle === 'configDef') {
    propsNodesRels = JSON.parse(sessionStorage.getItem(`props`))[0].nodes;

    let titleOfKeyAttribute = getDefType(valueOfAttribute.key.defId, valueOfAttribute.key.defTypeId).defTypeTitle;
    allKeyIdsByParent = clickedObj[`${titleOfKeyAttribute}s`]


    let allKeysByParent = propsNodesRels.filter(node => { return allKeyIdsByParent.includes(node.id) })

    allKeysByParent.forEach(propKey => {
      let filtered = propsNodesRels.filter(node => node.parentId === propKey.id)
      if (filtered.length > 0) {
        dropDownHtmlString += dropDown(propKey.title, filtered, null, propKey.id);
      }
    })
  }

  fieldsArray.push(dropDownHtmlString);





};

export function getFieldProperties(valueOfAttribute, fieldProperties) {
  let type = []
  if (valueOfAttribute?.fieldProperties && valueOfAttribute.fieldProperties) {
    type = valueOfAttribute.fieldProperties.map((property) => {
      return fieldProperties.find(obj => obj.fieldPropertyId === property)
    })
  }
  return type
}