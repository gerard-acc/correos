import { create } from 'zustand'

interface Comment  {
    selectedClient: string,
    comment: string,
    selectedWeek: string
}

interface UseStore {
    comments: Comment[]
    increaseComments: (by: Comment) => void
    clearComments: () => void
}

export const useGlobalStore = create<UseStore>()((set) => ({
  comments: [] ,
  increaseComments: (by: Comment) => set((state) => ({ 
    comments: [ ...state.comments, by ]  
    })), 
  clearComments: () => set({ comments: []}),
}))
