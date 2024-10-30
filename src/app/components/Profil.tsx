"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import React, { FC, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import s from "./Profil.module.scss";
import { BsGithub } from "react-icons/bs";
import { HiChatBubbleBottomCenterText } from "react-icons/hi2";
import { IoExit } from "react-icons/io5";

interface IChatWebSocket {
  username: string;
  photo: string;
  message: string;
}

const Profil: FC = () => {
  const [messages, setMessages] = useState<IChatWebSocket[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { data: session } = useSession();
  const { register, handleSubmit, reset } = useForm<{ message: string }>();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const initialWebSocket = () => {
    const ws = new WebSocket("wss://api.elchocrud.pro");
    ws.onopen = () => {
      console.log("WebSocket opened");
    };
    ws.onmessage = (event) => {
        console.log(JSON.parse(event.data))
        
      setMessages(JSON.parse(event.data));
    };
    ws.onerror = (error) => {
      console.log(error);
    };
    ws.onclose = () => {
      console.log("WebSocket closed");
      initialWebSocket()
    };
    setSocket(ws);
  };

  const onSubmit = handleSubmit((data) => {
    if (!session || !data.message.trim()) return;
    const messageData = {
      event: "message",
      username: session.user?.name || "Anonymous",
      photo: session.user?.image || "",
      message: data.message,
    };
    socket?.send(JSON.stringify(messageData));
    reset();
  });

  useEffect(() => {
    initialWebSocket();
    return () => {
      socket?.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="container">
      <div className={s.auth}>
        {session ? (
          <div className={s.profil}>
            <div className={s.chat}>
              <h1>
                Чат <HiChatBubbleBottomCenterText />
              </h1>
              <button onClick={() => signOut()}>
                Выйти <IoExit />
              </button>
            </div>
            <div className={s.chatContainer}>
              <div className={s.userInfo}>
                {session?.user?.image && (
                  <img
                    className={s.userImage}
                    src={session.user.image}
                    alt="img"
                  />
                )}
                <div>
                  <h6>{session?.user?.name}</h6>
                  <h6>{session?.user?.email}</h6>
                </div>
              </div>

              <div className={s.messagesContainer}>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`${s.message} ${
                      msg.username === session?.user?.name
                        ? s.myMessage
                        : s.otherMessage
                    }`}
                  >
                    <img className={s.userImage} src={msg.photo} alt="" />
                    <div>
                      <h6>{msg.username}</h6>
                      <p>{msg.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} /> {/* Прокрутка к этому элементу */}
              </div>

              <form onSubmit={onSubmit} className={s.messageForm}>
                <input
                  type="text"
                  placeholder="Введите сообщение"
                  {...register("message")}
                />
                <button type="submit">Отправить</button>
              </form>
            </div>
          </div>
        ) : (
          <div className={s.signIn}>
            <h1>
              <BsGithub />
            </h1>
            <button onClick={() => signIn("github")}>Войти через GitHub</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profil;
