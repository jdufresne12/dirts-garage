import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal'

interface SignOutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SignOutModal({ isOpen, onClose }: SignOutModalProps) {
    const { logout } = useAuth();

    const handleLogOut = () => {
        logout();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
        >
            <div>
                <h2 className="p-6 text-lg text-center font-semibold mb-4 text-black">Are you sure you want to sign out?</h2>
                <div className="flex justify-end gap-4 px-6 pb-4">
                    <button
                        onClick={handleLogOut}
                        className="flex items-center gap-1 px-3 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition-colors"
                    >
                        Log Out
                    </button>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    )
}