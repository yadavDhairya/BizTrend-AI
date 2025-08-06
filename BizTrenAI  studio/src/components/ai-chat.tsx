
"use client";

import { useEffect, useRef, useState } from 'react';

// This component is responsible for injecting the Botpress webchat script.
// It now defers script loading until the component has mounted on the client.
export default function AIChat() {
  const scriptInjected = useRef(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures the component only runs on the client-side
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    // This function will be called by Botpress when the webchat is opened for the first time.
    (window as any).proactiveTrigger = {
      loadBotpress: () => {
        // Prevent script from being added multiple times
        if (scriptInjected.current) {
          return;
        }
        scriptInjected.current = true;
        
        const script = document.createElement('script');
        script.id = 'botpress-webchat-script';
        script.src = 'https://cdn.botpress.cloud/webchat/v3.1/inject.js';
        script.async = true;
        
        script.onload = () => {
          (window as any).botpressWebChat?.init({
            configUrl: 'https://files.bpcontent.cloud/2025/07/31/21/20250731212236-8A1BF9OG.json',
            // Automatically open the chat window once the script has loaded
            "welcomeScreen": false,
            "openingStrategy": "page-visit"
          });
        };

        document.body.appendChild(script);
      }
    };

    // Cleanup function to remove the script when the component unmounts
    return () => {
      const existingScript = document.getElementById('botpress-webchat-script');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
      const botpressContainer = document.getElementById('botpress-webchat-container');
       if (botpressContainer) {
         botpressContainer.remove();
       }
       if ((window as any).botpressWebChat) {
        delete (window as any).botpressWebChat;
       }
       if ((window as any).proactiveTrigger) {
         delete (window as any).proactiveTrigger;
       }
    };
  }, [isClient]);

  // This component does not render anything itself. 
  // Botpress injects its own UI, which we trigger via the `proactiveTrigger`.
  return null;
}
