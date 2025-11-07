import { toast } from "../../components/shared/toast";


const INFO_DELAY = 2000;
const ERROR_DELAY = 3000;

export const handleReloadApp = async () => {
  if (navigator.onLine) {
    toast('Online: Clearing cache and forcing a hard reload...', 'info', INFO_DELAY);

    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      
      setTimeout(() => {
        window.location.reload();
      }, INFO_DELAY);

    } catch (error) {
      toast(`Error clearing cache: ${error}`, 'error', ERROR_DELAY);
      
      setTimeout(() => {
        window.location.reload();
      }, ERROR_DELAY);
    }
  } else {
    toast('Offline: Performing a simple refresh...', 'info', INFO_DELAY);
    
    setTimeout(() => {
      window.location.reload();
    }, INFO_DELAY);
  }
};