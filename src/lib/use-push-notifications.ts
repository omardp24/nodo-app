"use client";

import { useCallback, useEffect, useState } from "react";
import { notificacionesApi } from "./resources";

function base64UrlToUint8Array(base64Url: string): BufferSource {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes.buffer;
}

function soportaPush() {
  return (
    typeof navigator !== "undefined" && "serviceWorker" in navigator && "PushManager" in window
  );
}

export function usePushNotifications() {
  const [soportado] = useState(soportaPush);
  const [suscrito, setSuscrito] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!soportado) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then(async (registro) => {
        const sub = await registro.pushManager.getSubscription();
        setSuscrito(sub !== null);
      })
      .catch((error) => {
        // El navegador (o un entorno sandboxeado) puede bloquear el registro del
        // Service Worker — no es fatal, solo dejamos "activar" deshabilitado en la práctica.
        console.warn("No se pudo registrar el Service Worker de notificaciones:", error);
      });
  }, [soportado]);

  const activar = useCallback(async () => {
    if (!soportado) return;
    setCargando(true);
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") return;

      const registro = await navigator.serviceWorker.register("/sw.js");
      const sub = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });
      const json = sub.toJSON();
      await notificacionesApi.suscribir({
        endpoint: json.endpoint!,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
      });
      setSuscrito(true);
    } catch (error) {
      console.warn("No se pudo activar las notificaciones push:", error);
    } finally {
      setCargando(false);
    }
  }, [soportado]);

  return { soportado, suscrito, cargando, activar };
}
