import { useState } from "react";
import Dropdown from "./Dropdown";
import Toggle from "./Toggle";
import Footer from "./Footer";
import { SimilarityMetric } from "../app/hooks/useConfiguration";
import { ChatState } from "../app/hooks/useConfiguration";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  useRag: boolean;
  llm: string;
  similarityMetric: SimilarityMetric;
  chatState: ChatState;
  skill: string;
  email: string;
  setConfiguration: (useRag: boolean, llm: string, similarityMetric: SimilarityMetric, chatState : ChatState, skill : string, email : string) => void;
}

const Configure = ({ isOpen, onClose, useRag, llm, similarityMetric, chatState, skill, email, setConfiguration }: Props) => {
  const [rag, setRag] = useState(useRag);
  const [selectedLlm, setSelectedLlm] = useState(llm);
  const [selectedSimilarityMetric, setSelectedSimilarityMetric] = useState<SimilarityMetric>(similarityMetric);
  const [selectedChatState, setChatState] = useState<ChatState>(chatState);
  const [selectedSkill, setSelectedSkill] = useState(skill);
  const [selectedEmail, setSelectedEmail] = useState(email);
  
  if (!isOpen) return null;

  const llmOptions = [
    { label: 'GPT 3.5 Turbo', value: 'gpt-3.5-turbo' },
    { label: 'GPT 4', value: 'gpt-4' }
  ];

  const similarityMetricOptions = [
    { label: 'Cosine Similarity', value: 'cosine' },
    { label: 'Euclidean Distance', value: 'euclidean' },
    { label: 'Dot Product', value: 'dot_product' }
  ];

  const chatStateOptions = [
    { label: 'asking', value: 'asking' },
    { label: 'waiting', value: 'waiting' },
    { label: 'grading', value: 'grading' }
  ];

  // eventually want to pull this from the database, but for now just hard-code
  const skillOptions = [
    { label: 'Extremophiles on Earth', value: 'Extremophiles on Earth' },
    { label: 'Life\'s Essential Conditions', value: 'Life\'s Essential Conditions' },
    { label: 'Antarctic Subglacial Life', value: 'Antarctic Subglacial Life' },
    { label: 'Evidence of Life', value: 'Evidence of Life' },
    { label: 'Cellular Units of Life', value: 'Cellular Units of Life' }
  ];

  const emailOptions = [
    { label: 'xand0001@student.monash.edu', value: 'xand0001@student.monash.edu' },
    { label: 'sben0007@student.monash.edu', value: 'sben0007@student.monash.edu' }
  ];

  const handleSave = () => {
    setConfiguration(
        rag,
        selectedLlm,
        selectedSimilarityMetric,
        selectedChatState,
        selectedSkill,
        selectedEmail
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="chatbot-section flex flex-col origin:w-[800px] w-full origin:h-[735px] h-full p-6 rounded shadow-lg overflow-auto">
        <div className="grow">
          <div className='pb-6 flex justify-between'>
            <h1 className='chatbot-text-primary text-xl md:text-2xl font-medium'>Configure</h1>
            <button
              onClick={onClose}
              className="chatbot-text-primary text-4xl font-thin leading-8"
            >
              <span aria-hidden>×</span>
            </button>
          </div>
          <div className="flex mb-4">
            <Dropdown
              fieldId="llm"
              label="LLM"
              options={llmOptions}
              value={selectedLlm}
              onSelect={setSelectedLlm}
            />
            <Toggle enabled={rag} label="Enable vector content (RAG)" onChange={() => setRag(!rag)} />
          </div>
          <Dropdown
            fieldId="similarityMetric"
            label="Similarity Metric"
            options={similarityMetricOptions}
            value={selectedSimilarityMetric}
            onSelect={setSelectedSimilarityMetric}
          />
          <Dropdown // probably want to delete this
            fieldId="chatState"
            label="Chat State"
            options={chatStateOptions}
            value={selectedChatState}
            onSelect={setChatState}
          />
          <Dropdown
            fieldId="skill"
            label="Skill"
            options={skillOptions}
            value={selectedSkill}
            onSelect={setSelectedSkill}
          />
          <Dropdown
            fieldId="email"
            label="Email"
            options={emailOptions}
            value={selectedEmail}
            onSelect={setSelectedEmail}
          />
        </div>
        <div className="self-end w-full">
          <div className="flex justify-end gap-2">
            <button
              className='chatbot-button-secondary flex rounded-md items-center justify-center px-2.5 py-3'
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className='chatbot-button-primary flex rounded-md items-center justify-center px-2.5 py-3'
              onClick={handleSave}
            >
              Save Configuration
            </button>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Configure;
