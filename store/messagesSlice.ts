import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  Message,
  SortOrder,
  FilterType,
  ColumnType,
  BackendMessage,
} from "../types";
import { mapBackendToMessage } from "../utils/messageMapper";
import {
  loadColumnStateFromLocalStorage,
  loadFavoritesFromLocalStorage,
  saveFavoritesToLocalStorage,
} from "../utils/localStorageUtils";

interface BackendResponse {
  Messages: BackendMessage[];
  likeImages: any[];
  dislikeImages: any[];
}

interface FetchParams {
  messageId?: number;
  oldMessages?: boolean;
}
const getMaxMessageId = (messages: Message[]): number => {
  if (messages.length === 0) return 0;
  return Math.max(...messages.map((m) => Number(m.id)));
};

const fetchMessagesFromApi = async (
  params: FetchParams
): Promise<Message[]> => {
  const formData = new FormData();
  formData.append("actionName", "MessagesLoad");

  if (params.oldMessages) {
    formData.append("oldMessages", "true");
  } else {
    formData.append("messageId", String(params.messageId || 0));
  }

  const response = await fetch("http://a0830433.xsph.ru/", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: BackendResponse = await response.json();

  return (data.Messages || []).map((msg) => mapBackendToMessage(msg, "center"));
};

export const fetchMessages = createAsyncThunk<
  {
    messages: Message[];
    isInitial: boolean;
    isOld: boolean;
    requestedMessageId: number;
  },
  FetchParams,
  { rejectValue: string }
>("messages/fetchMessages", async (params, { rejectWithValue }) => {
  try {
    const messages = await fetchMessagesFromApi(params);
    return {
      messages,
      isInitial: params.messageId === 0,
      isOld: !!params.oldMessages,
      requestedMessageId: params.messageId || 0,
    };
  } catch (error: any) {
    return rejectWithValue(error.message || "Ошибка загрузки сообщений");
  }
});

export interface MessagesState {
  messages: Message[];
  sortOrder: SortOrder;
  filter: FilterType;
  loading: boolean;
  error: string | null;
  highestMessageId: number;
}

const initialState: MessagesState = {
  messages: [],
  sortOrder: "oldest",
  filter: "all",
  loading: false,
  error: null,
  highestMessageId: 0,
};

export const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    moveMessage: (
      state,
      action: PayloadAction<{
        messageId: number | string;
        targetColumn: ColumnType;
      }>
    ) => {
      const msg = state.messages.find((m) => m.id === action.payload.messageId);
      if (msg) {
        msg.column = action.payload.targetColumn;
        const columnState = state.messages.reduce((acc, m) => {
          acc[String(m.id)] = m.column;
          return acc;
        }, {} as Record<string, ColumnType>);
        localStorage.setItem("messageColumns", JSON.stringify(columnState));
      }
    },
    setSortOrder: (state, action: PayloadAction<SortOrder>) => {
      state.sortOrder = action.payload;
    },
    setFilter: (state, action: PayloadAction<FilterType>) => {
      state.filter = action.payload;
    },
    toggleFavorite: (state, action: PayloadAction<number | string>) => {
      const msg = state.messages.find((m) => m.id === action.payload);
      if (msg) {
        msg.isFavorite = !msg.isFavorite;
        const favorites: Record<string | number, boolean> = {};
        state.messages.forEach((m) => {
          favorites[m.id] = m.isFavorite;
        });
        saveFavoritesToLocalStorage(favorites);
      }
    },
    deleteMessage: (state, action: PayloadAction<number | string>) => {
      state.messages = state.messages.filter((m) => m.id !== action.payload);
      const favorites: Record<string | number, boolean> = {};
      state.messages.forEach((m) => {
        favorites[m.id] = m.isFavorite;
      });
      saveFavoritesToLocalStorage(favorites);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { messages, isInitial, isOld } = action.payload;

        if (isInitial) {
          const savedFavorites = loadFavoritesFromLocalStorage();
          const savedColumns = loadColumnStateFromLocalStorage();

          state.messages = messages.map((msg) => ({
            ...msg,
            isFavorite: !!savedFavorites[String(msg.id)],
            column: savedColumns[String(msg.id)] || "center",
          }));

          if (messages.length > 0) {
            state.highestMessageId = Math.max(
              ...messages.map((m) => Number(m.id))
            );
          }
        } else if (isOld) {
          const existingIds = new Set(state.messages.map((m) => String(m.id)));
          const trulyOldMessages = messages.filter(
            (msg) => !existingIds.has(String(msg.id))
          );
          state.messages = [...trulyOldMessages, ...state.messages];

          if (trulyOldMessages.length > 0) {
            const oldMaxId = Math.max(
              ...trulyOldMessages.map((m) => Number(m.id))
            );
            if (oldMaxId > state.highestMessageId) {
              state.highestMessageId = oldMaxId;
            }
          }
        } else {
          const existingIds = new Set(state.messages.map((m) => String(m.id)));
          const trulyNewMessages = messages.filter(
            (msg) => !existingIds.has(String(msg.id))
          );

          if (trulyNewMessages.length > 0) {
            state.messages = [...state.messages, ...trulyNewMessages];

            const newMaxId = Math.max(
              ...trulyNewMessages.map((m) => Number(m.id))
            );
            if (newMaxId > state.highestMessageId) {
              state.highestMessageId = newMaxId;
            }
          }
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Неизвестная ошибка";
      });
  },
});

export const {
  setSortOrder,
  setFilter,
  moveMessage,
  toggleFavorite,
  deleteMessage,
} = messagesSlice.actions;

// export const startPolling =
//   () => (dispatch: any, getState: () => { messages: MessagesState }) => {
//     const poll = async () => {
//       const state = getState();
//       await dispatch(
//         fetchMessages({ messageId: state.messages.highestMessageId })
//       );
//     };

//     poll();
//     const interval = setInterval(poll, 5000);
//     return () => clearInterval(interval);
//   };

export const fetchInitialMessages = () => (dispatch: any) => {
  return dispatch(fetchMessages({ messageId: 0 }));
};

export default messagesSlice.reducer;
