"use client"

import { useState, useEffect } from 'react';

export type SimilarityMetric = "cosine" | "euclidean" | "dot_product";
export type ChatState = "asking" | "waiting" | "grading";

const useConfiguration = () => {
  // Safely get values from localStorage
  const getLocalStorageValue = (key: string, defaultValue: any) => { // key is as per key: value pairing.
    if (typeof window !== 'undefined') { // check if local storage is available first
      const storedValue = localStorage.getItem(key); // get the value from local storage
      if (storedValue !== null) { // if its not null, return it, otherwise just return the default value
        return storedValue;
      }
    }
    return defaultValue;
  };

  const [useRag, setUseRag] = useState<boolean>(() => getLocalStorageValue('useRag', 'true') === 'true'); // if nothing, its true
  const [llm, setLlm] = useState<string>(() => getLocalStorageValue('llm', 'gpt-3.5-turbo')); // if nothing, its gpt-3.5-turbo
  const [similarityMetric, setSimilarityMetric] = useState<SimilarityMetric>(
    () => getLocalStorageValue('similarityMetric', 'cosine') as SimilarityMetric // default to cosine metric
  );
  const [chatState, setChatState] = useState<ChatState>(
    () => getLocalStorageValue('chatState', 'waiting') as ChatState // defaults to the asking state
  );

  const setConfiguration = (rag: boolean, llm: string, similarityMetric: SimilarityMetric, chatState: ChatState) => { // a single function that will set all of the config variables
    setUseRag(rag);
    setLlm(llm);
    setSimilarityMetric(similarityMetric);
    setChatState(chatState);
  }

  // Persist to localStorage
  useEffect(() => { // useEffect will run the function (1st input) if any of the variables in the array (2nd input) change
    if (typeof window !== 'undefined') { 
      localStorage.setItem('useRag', JSON.stringify(useRag));
      localStorage.setItem('llm', llm);
      localStorage.setItem('similarityMetric', similarityMetric);
      localStorage.setItem('chatState', chatState);
    }
  }, [useRag, llm, similarityMetric, chatState]); // so run this if any of the above variables change at all

  return {
    useRag,
    llm,
    similarityMetric,
    chatState,
    setConfiguration,
  }; // return all of the variables and the function to set them
}

export default useConfiguration;
