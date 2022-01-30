class Mutations {
  async GET_STATE(view, records) {
    let data = await JSON.parse(sessionStorage.getItem(`${view}`));
    //console.log(data)

    if (data == null) {
      data = [];
      data.push(records);
      //console.log("data", data);
      sessionStorage.setItem(`${view}`, JSON.stringify(data));
    }
  }
}

class Actions {
  // async CREATE(nodeType, type) {

  //     const record = await fetch(`/api/${nodeType}/create`, {
  //         method: 'POST',
  //         headers: {
  //             'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ type }),
  //     })

  //     const sendRecord = await record.json();
  //     const mutate = new Mutations();
  //     mutate.SET_STATE(nodeType, sendRecord);
  // }

  async GETALL(view) {
    let getHeaders = {
      "Content-Type": "application/json",
      authorization: sessionStorage.getItem("accessToken"),
    };
    const records = await fetch(`/api/${view}`, {
      method: "GET",
      headers: getHeaders,
    });

    const sendRecords = await records.json();
    const mutate = new Mutations();
    mutate.GET_STATE(view, sendRecords);
  }
}

export default new Actions();
