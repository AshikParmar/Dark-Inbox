'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Message } from '@/model/userModel';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { toast } from 'sonner';
import { useMessageStream } from '@/hooks/useMessageStream';

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const { data: session } = useSession();

  const username = session?.user?.username ?? '';
  const { messages: streamMessages, isConnected } = useMessageStream(username);

  // Append only new stream messages
  useEffect(() => {
    if (streamMessages.length > 0) {
      const newMessages = streamMessages.filter(
        (newMsg) => !messages.some((msg) => msg._id === newMsg._id)
      );
      if (newMessages.length > 0) {
        setMessages((prev) => [...newMessages, ...prev]);
        toast.success('New message received!');
      }
    }
  }, [streamMessages, messages]);

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((message) => message._id !== messageId));
  };

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessages', response?.data?.isAcceptingMessages!);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? 'Failed to fetch message settings');
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages');
      setMessages(response.data.messages || []);
      if (refresh) {
        toast.success('Refreshed Messages', { description: 'Showing latest messages' });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    fetchMessages();
    fetchAcceptMessages();
  }, [session, fetchMessages, fetchAcceptMessages]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      });
      setValue('acceptMessages', !acceptMessages);
      toast.success(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? 'Failed to update message settings');
    }
  };

  const profileUrl = useMemo(() => {
    if (typeof window === 'undefined' || !username) return '';
    return `${window.location.protocol}//${window.location.host}/u/${username}`;
  }, [username]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.info('URL Copied!', {
      description: 'Profile URL has been copied to clipboard.',
    });
  };

  if (!session?.user) {
    return <div></div>;
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center justify-between bg-gray-200 border border-gray-700 rounded-xl p-2 cursor-pointer w-full">
          <a
            href={profileUrl}
            target="_blank"
            className="ml-2 font-medium underline truncate hover:text-blue-900"
          >
            {profileUrl}
          </a>
          <Button onClick={copyToClipboard} className="ml-4 text-sm">
            Copy
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <Switch
            {...register('acceptMessages')}
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            disabled={isSwitchLoading}
          />
          <span className="ml-2">
            Accept Messages: {acceptMessages ? 'On' : 'Off'}
          </span>
        </div>

        <Button
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            fetchMessages(true);
          }}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Separator />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <p>Loading messages...</p>
        ) : messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message._id ?? index}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
