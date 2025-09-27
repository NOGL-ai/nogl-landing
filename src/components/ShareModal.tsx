import { Dialog, Transition } from '@headlessui/react';
import { FC, Fragment, useState, useEffect } from 'react';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  LinkedinShareButton,
  WhatsappShareButton,
  EmailShareButton 
} from 'react-share';
import { toast } from 'react-hot-toast';
import { SessionWithExpert } from '@/types/session';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionWithExpert;
}

const ShareModal: FC<ShareModalProps> = ({ isOpen, onClose, session }) => {
  const [shareUrl, setShareUrl] = useState('');
  const title = session.title;

  useEffect(() => {
    // Set the share URL once the component mounts
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/listing-session-detail/${session.id}`);
    }
  }, [session.id]);

  if (!shareUrl) return null; // Don't render until we have the shareUrl

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-neutral-800">
              <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                Share Session
              </Dialog.Title>

              {/* Copy Link */}
              <div className="flex items-center gap-2 mb-4">
                <input 
                  type="text" 
                  value={shareUrl} 
                  readOnly 
                  className="flex-1 p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                />
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success('Link copied!');
                  }}
                  className="p-2 bg-primary-500 text-white rounded hover:bg-primary-600"
                >
                  Copy
                </button>
              </div>

              {/* Social Share Buttons - Updated Props */}
              <div className="grid grid-cols-4 gap-4">
                <FacebookShareButton 
                  url={shareUrl} 
                  hashtag="#ExpertSession"
                >
                  <div className="flex flex-col items-center gap-1">
                    <i className="lab la-facebook text-2xl text-blue-600"></i>
                    <span className="text-xs">Facebook</span>
                  </div>
                </FacebookShareButton>

                <TwitterShareButton 
                  url={shareUrl} 
                  title={title}
                  hashtags={['ExpertSession']}
                >
                  <div className="flex flex-col items-center gap-1">
                    <i className="lab la-twitter text-2xl text-blue-400"></i>
                    <span className="text-xs">Twitter</span>
                  </div>
                </TwitterShareButton>

                <LinkedinShareButton 
                  url={shareUrl} 
                  title={title}
                  summary={session.description || ''}
                  source={typeof window !== 'undefined' ? window.location.origin : ''}
                >
                  <div className="flex flex-col items-center gap-1">
                    <i className="lab la-linkedin text-2xl text-blue-700"></i>
                    <span className="text-xs">LinkedIn</span>
                  </div>
                </LinkedinShareButton>

                <WhatsappShareButton 
                  url={shareUrl} 
                  title={title}
                  separator=" - "
                >
                  <div className="flex flex-col items-center gap-1">
                    <i className="lab la-whatsapp text-2xl text-green-500"></i>
                    <span className="text-xs">WhatsApp</span>
                  </div>
                </WhatsappShareButton>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ShareModal; 