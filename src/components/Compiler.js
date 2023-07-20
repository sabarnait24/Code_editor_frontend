import React, { useState } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";

import logo from "../icons8-play-67.png";
import SocketClient from "./SocketClient";
import { useParams } from "react-router-dom";

import { io } from "socket.io-client";

const socket = io("https://code-editor-server-z176.onrender.com");
function Compiler() {
  const params = useParams();

  const [data, setData] = useState("");
  const [outputValue, setOutputValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [lang, setLang] = useState("c");

  const roomID = params.Id;
  const username = params.username;

  const selectElement = document.getElementById("langselect");

  if (selectElement) {
    selectElement.addEventListener("change", () => {
      if (selectElement.value === "cpp17") setLang("Cpp");
      else if (selectElement.value === "python3") setLang("Python");
      else setLang(selectElement.value);
    });
  }

  const onSubmit = async () => {
    var e = document.getElementById("langselect");
    var lang = e.value;
    const odata = {
      code: data,
      lang: lang,
      input: inputValue,
    };
    // console.log(odata);
    await fetch("https://code-editor-server-z176.onrender.com/compile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(odata),
    })
      .then((result) => {
        // console.log(result);
        return result.json();
      })
      .then((getdata) => {
        handleOutputChange(getdata.output);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCodeChange = (e) => {
    // console.log("hehe",value);

    // if (isEditorUpdateInProgress) {
    //   return;
    // }
    const value = e.target.value;
    setData(value);
    socket.emit("codeChange", {
      roomID,
      value,
    });
  };

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    socket.emit("inputChange", {
      roomID,
      newValue,
    });
  };
  const handleOutputChange = (output) => {
    setOutputValue(output);
    socket.emit("outputChange", {
      roomID,
      output,
    });
  };

  socket.on("inputChangeListen", (data) => {
    if (roomID !== data.roomID) {
      return;
    }
    setInputValue(data.newValue);
  });

  socket.on("outputChangeListen", (data) => {
    if (roomID !== data.roomID) {
      return;
    }

    setOutputValue(data.output);
  });

  socket.on("codeChangeListen", (data) => {
    if (roomID !== data.roomID) {
      return;
    }

    setData(data.value);
  });

  return (
    <div className="grid grid-cols-10 divide-x ">
      <div className="col-span-2 bg-slate-50">
        <SocketClient
          roomID={roomID}
          username={username}
          data={data}
          socket={socket}
        ></SocketClient>
      </div>
      <div className=" min-h-screen bg-slate-50 col-span-7">
        <h2
          className="flex justify-center my-2 text-black font-black
        "
        >
          ONLINE IDE
        </h2>
        <div className="grid grid-cols-2">
          <select
            className="select select-bordered w-3/4 max-w-xs bg-slate-200 text-black my-2  border border-black justify-end"
            style={{ width: "250px" }}
            id="langselect"
          >
            <option value="c" className="text-black">
              C
            </option>
            <option value="cpp17" className="text-black">
              Cpp
            </option>
            <option value="java" className="text-black">
              Java
            </option>
            <option value="python3" className="text-black">
              Python
            </option>
          </select>
          <div className="flex justify-end">
            <button
              className="btn btn-outline btn-success my-2"
              style={{ width: "120px", height: "5px" }}
              onClick={onSubmit}
            >
              Run
              <img
                src={logo}
                alt=""
                style={{ width: "20px" }}
                className="mx-1"
              ></img>{" "}
            </button>
          </div>
        </div>

        <div className="relative flex h-3/5">
          <CodeEditor
            value={data}
            language={lang}
            placeholder="write code here"
            onChange={handleCodeChange}
            padding={15}
            className="w-full inset-0 resize-none p-2 "
            style={{
              fontSize: 16,
              backgroundColor: "dark",
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
            }}
          />
        </div>

        <div className="grid grid-cols-2 items-end ">
          <div className="pr-2 my-1">
            <p className="text-black my-1 flex justify-center font-extrabold">
              INPUT FILE
            </p>
            <textarea
              className="textarea textarea-bordered bg-black w-full h-56 text-white text-lg font-extrabold"
              value={inputValue}
              onChange={handleInputChange}
            />
          </div>
          <div className="pl-2 my-1">
            <p className="text-black my-1 flex justify-center font-extrabold">
              OUTPUT FILE
            </p>
            <textarea
              className="textarea textarea-bordered bg-black w-full h-56 text-white text-lg font-extrabold"
              value={outputValue}
            ></textarea>
          </div>
        </div>
      </div>
      <div className="col-span-1 bg-slate-50"></div>
    </div>
  );
}

export default Compiler;
