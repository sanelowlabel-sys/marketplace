import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  DollarSign, 
  MapPin, 
  ShieldCheck, 
  Check, 
  X, 
  Clock, 
  ExternalLink, 
  MessageSquare, 
  UserCheck, 
  ArrowRightLeft,
  Navigation,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { SAFE_EXCHANGE_PRESETS } from '../data/mockData';
import { MeetingPoint } from '../types';

export const ChatView: React.FC = () => {
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversationId, 
    getConversationMessages, 
    sendMessage, 
    respondToOffer,
    currentUser, 
    availableUsers,
    setCurrentUserById,
    getListingById, 
    getUserById,
    viewListingDetail
  } = useMarketplace();

  const [messageInput, setMessageInput] = useState('');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerAmountInput, setOfferAmountInput] = useState('');
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [counterModalMessageId, setCounterModalMessageId] = useState<string | null>(null);
  const [counterAmountInput, setCounterAmountInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConversationId]);

  // Selected conversation data
  const currentConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const listing = currentConversation ? getListingById(currentConversation.listing_id) : undefined;
  
  const otherUserId = currentConversation 
    ? (currentConversation.buyer_id === currentUser.id ? currentConversation.seller_id : currentConversation.buyer_id)
    : '';
  const otherUser = getUserById(otherUserId);

  const activeMessages = currentConversation ? getConversationMessages(currentConversation.id) : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentConversation) return;
    sendMessage(currentConversation.id, messageInput.trim());
    setMessageInput('');
  };

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(offerAmountInput);
    if (isNaN(amount) || amount <= 0 || !currentConversation) return;
    sendMessage(currentConversation.id, `Offer submitted: $${amount.toLocaleString()}`, {
      isOffer: true,
      offerAmount: amount,
    });
    setOfferAmountInput('');
    setIsOfferModalOpen(false);
  };

  const handleShareMeetingPoint = (point: typeof SAFE_EXCHANGE_PRESETS[0]) => {
    if (!currentConversation) return;
    const meetingPoint: MeetingPoint = {
      name: point.name,
      address: point.address,
      type: point.type,
      coordinates: point.coordinates,
      notes: point.notes,
    };
    sendMessage(currentConversation.id, `Proposed Meeting Point: ${point.name} (${point.address})`, {
      meetingPoint,
    });
    setIsMeetingModalOpen(false);
  };

  const handleCounterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterModalMessageId) return;
    const amount = parseFloat(counterAmountInput);
    if (isNaN(amount) || amount <= 0) return;
    respondToOffer(counterModalMessageId, 'countered', amount);
    setCounterModalMessageId(null);
    setCounterAmountInput('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Container with Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden rounded-xl border border-[#3a3a3a] bg-[#222222] shadow-2xl h-[78vh] min-h-[580px]">
        
        {/* LEFT COLUMN: CONVERSATIONS LIST (4 cols) */}
        <div className="md:col-span-4 border-r border-[#3a3a3a] bg-[#1a1a1a] flex flex-col h-full">
          
          {/* Header */}
          <div className="border-b border-[#3a3a3a] p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#BE1E2F]" />
              <h2 className="text-sm font-['Hammersmith_One'] uppercase tracking-wider text-white">
                Messages Inbox
              </h2>
            </div>
            <span className="rounded bg-[#2b2b2b] px-2 py-0.5 text-[10px] font-mono text-white/60">
              {conversations.length} Threads
            </span>
          </div>

          {/* Conversation List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#2e2e2e]">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-white/40">
                No active conversations. Browse listings and click "Message Seller" to start a conversation.
              </div>
            ) : (
              conversations.map((conv) => {
                const convListing = getListingById(conv.listing_id);
                const counterpartId = conv.buyer_id === currentUser.id ? conv.seller_id : conv.buyer_id;
                const counterpart = getUserById(counterpartId);
                const isSelected = conv.id === activeConversationId;
                const messagesList = getConversationMessages(conv.id);
                const lastMsg = messagesList[messagesList.length - 1];

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                      isSelected 
                        ? 'bg-[#2b2b2b] border-l-4 border-l-[#BE1E2F]' 
                        : 'hover:bg-[#222222]'
                    }`}
                  >
                    {/* Listing Thumbnail + Counterpart Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={convListing?.images[0]?.image_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100&auto=format&fit=crop&q=80'}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover border border-[#3a3a3a]"
                      />
                      <img
                        src={counterpart?.avatar_url || currentUser.avatar_url}
                        alt=""
                        className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full object-cover ring-2 ring-[#1a1a1a]"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-xs text-white truncate">
                          {counterpart?.full_name || 'Marketplace Member'}
                        </span>
                        {convListing && (
                          <span className="font-mono text-[11px] font-bold text-[#BE1E2F] shrink-0">
                            ${convListing.price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-white/50 truncate mt-0.5">
                        {convListing?.title || 'Listing item'}
                      </p>

                      <p className="text-xs text-white/70 truncate mt-1">
                        {lastMsg ? lastMsg.content : 'Started conversation'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Persona Switcher for Testing Live P2P Chat */}
          <div className="border-t border-[#3a3a3a] p-3 bg-[#222222]">
            <div className="flex items-center justify-between text-[11px] text-white/60 mb-2">
              <span className="font-mono uppercase">Live Persona:</span>
              <span className="text-white font-medium truncate">{currentUser.full_name}</span>
            </div>
            {otherUser && (
              <button
                type="button"
                onClick={() => setCurrentUserById(otherUser.id)}
                className="w-full flex items-center justify-center gap-1.5 rounded border border-[#BE1E2F]/50 bg-[#BE1E2F]/10 py-1.5 text-xs text-[#BE1E2F] hover:bg-[#BE1E2F] hover:text-white transition-all font-mono"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span>Switch to {otherUser.full_name.split(' ')[0]}</span>
              </button>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: ACTIVE CHAT THREAD (8 cols) */}
        <div className="md:col-span-8 flex flex-col h-full bg-[#222222]">
          
          {currentConversation && listing ? (
            <>
              {/* TOP PINNED ITEM CONTEXT CARD */}
              <div className="border-b border-[#3a3a3a] bg-[#1d1d1d] p-3 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={listing.images[0]?.image_url}
                    alt=""
                    className="h-11 w-11 rounded-md object-cover border border-[#3a3a3a] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-xs text-white truncate max-w-sm sm:max-w-md">
                        {listing.title}
                      </h3>
                      <span className="rounded bg-[#BE1E2F]/20 px-1.5 py-0.2 text-[10px] font-mono text-[#BE1E2F]">
                        {listing.condition}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs">
                      <span className="font-['DM_Mono'] font-bold text-white">
                        ${listing.price.toLocaleString()}
                      </span>
                      <span className="text-white/40">•</span>
                      <span className="text-white/60 text-[11px] truncate">
                        {listing.location_geojson.city}, {listing.location_geojson.state}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => viewListingDetail(listing.id)}
                    className="flex items-center gap-1 rounded-md border border-[#3a3a3a] bg-[#2b2b2b] px-2.5 py-1 text-xs text-white hover:bg-[#333] transition-colors"
                  >
                    <span>View</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>

                  <button
                    onClick={() => setIsOfferModalOpen(true)}
                    className="btn px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Offer</span>
                  </button>
                </div>
              </div>

              {/* MESSAGES STREAM */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeMessages.map((msg) => {
                  const isMe = msg.sender_id === currentUser.id;
                  const sender = getUserById(msg.sender_id);

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                        {!isMe && (
                          <img
                            src={sender?.avatar_url || otherUser?.avatar_url}
                            alt=""
                            className="h-7 w-7 rounded-full object-cover ring-1 ring-[#BE1E2F] shrink-0"
                          />
                        )}

                        <div className="space-y-1.5">
                          {/* Standard Message Bubble */}
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                              isMe
                                ? 'bg-[#BE1E2F] text-white rounded-br-none'
                                : 'bg-[#2b2b2b] text-white/95 border border-[#3a3a3a] rounded-bl-none'
                            }`}
                          >
                            <p>{msg.content}</p>
                          </div>

                          {/* INTERACTIVE OFFER NEGOTIATION CARD */}
                          {msg.is_offer && msg.offer_amount && (
                            <div className="rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] p-3 text-xs space-y-2 shadow-lg">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] uppercase text-white/50">Marketplace Offer</span>
                                <span className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase font-bold ${
                                  msg.offer_status === 'accepted'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : msg.offer_status === 'declined'
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                    : msg.offer_status === 'countered'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                                }`}>
                                  {msg.offer_status || 'Pending'}
                                </span>
                              </div>

                              <div className="font-mono text-base font-bold text-white flex items-center justify-between">
                                <span>${msg.offer_amount.toLocaleString()} USD</span>
                                {msg.counter_amount && (
                                  <span className="text-amber-300 text-xs font-mono">
                                    Counter: ${msg.counter_amount.toLocaleString()}
                                  </span>
                                )}
                              </div>

                              {/* Actions for receiver if pending */}
                              {!isMe && msg.offer_status === 'pending' && (
                                <div className="flex gap-2 pt-1">
                                  <button
                                    onClick={() => respondToOffer(msg.id, 'accepted')}
                                    className="flex-1 rounded bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Accept</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCounterModalMessageId(msg.id);
                                      setCounterAmountInput(Math.round(msg.offer_amount! * 1.05).toString());
                                    }}
                                    className="flex-1 rounded bg-amber-600 py-1.5 text-xs font-bold text-white hover:bg-amber-500 transition-colors"
                                  >
                                    Counter
                                  </button>
                                  <button
                                    onClick={() => respondToOffer(msg.id, 'declined')}
                                    className="rounded border border-[#444] px-2.5 py-1.5 text-xs text-white/60 hover:bg-[#333] hover:text-white"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* SAFE MEETING POINT PINNED CARD */}
                          {msg.meeting_point && (
                            <div className="rounded-lg border border-emerald-500/40 bg-[#162319] p-3 text-xs space-y-1.5 shadow-md">
                              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] font-bold">
                                <ShieldCheck className="h-4 w-4" />
                                <span>Verified Safe Exchange Zone</span>
                              </div>
                              <h4 className="font-semibold text-white">{msg.meeting_point.name}</h4>
                              <p className="text-white/70 text-[11px]">{msg.meeting_point.address}</p>
                              {msg.meeting_point.notes && (
                                <p className="text-[10px] text-white/50 italic">{msg.meeting_point.notes}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="font-['DM_Mono'] text-[10px] text-white/40 mt-1 px-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* QUICK REPLIES BAR */}
              <div className="border-t border-[#3a3a3a] bg-[#1c1c1c] px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0">
                <span className="text-[10px] font-mono uppercase text-white/40 shrink-0">Quick:</span>
                {[
                  'Is this still available?',
                  'Can we meet today?',
                  'What payment methods do you take?',
                  'Ready to buy at listed price!',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setMessageInput(prompt)}
                    className="shrink-0 rounded bg-[#2b2b2b] px-2.5 py-1 text-[11px] text-white/80 border border-[#3a3a3a] hover:border-[#BE1E2F] hover:text-white transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* INPUT BAR */}
              <div className="border-t border-[#3a3a3a] bg-[#1a1a1a] p-3 shrink-0">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  
                  {/* Share Safe Meeting Point Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsMeetingModalOpen(true)}
                    className="rounded-md border border-[#3a3a3a] bg-[#2b2b2b] p-2 text-white/80 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                    title="Share Verified Safe Pickup Location"
                  >
                    <ShieldCheck className="h-4 w-4" />
                  </button>

                  {/* Make Offer Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsOfferModalOpen(true)}
                    className="rounded-md border border-[#3a3a3a] bg-[#2b2b2b] p-2 text-white/80 hover:border-[#BE1E2F] hover:text-[#BE1E2F] transition-colors"
                    title="Make an Offer"
                  >
                    <DollarSign className="h-4 w-4" />
                  </button>

                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Message ${otherUser?.full_name || 'seller'}...`}
                    className="flex-1 rounded-md border border-[#3a3a3a] bg-[#2b2b2b] px-3.5 py-2 text-xs sm:text-sm text-white placeholder-white/40 focus:border-[#BE1E2F] focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="btn px-4 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-white/50">
              Select a conversation from the left inbox to view messages.
            </div>
          )}

        </div>

      </div>

      {/* MAKE OFFER MODAL */}
      {isOfferModalOpen && listing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-[#3a3a3a] bg-[#222222] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3a3a3a] pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#BE1E2F]" />
                <span>Submit Cash Offer</span>
              </h3>
              <button onClick={() => setIsOfferModalOpen(false)} className="text-white/50 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="mt-4 space-y-4">
              <div>
                <span className="text-xs font-mono text-white/50">Current Price:</span>
                <p className="font-mono text-xl font-bold text-white">${listing.price.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-white/60 mb-1">Your Offer ($)</label>
                <input
                  type="number"
                  min={1}
                  step={5}
                  value={offerAmountInput}
                  onChange={(e) => setOfferAmountInput(e.target.value)}
                  placeholder={Math.round(listing.price * 0.9).toString()}
                  className="w-full rounded-md border border-[#3a3a3a] bg-[#1a1a1a] px-3 py-2 font-mono text-base text-white focus:border-[#BE1E2F] focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="flex-1 rounded border border-[#3a3a3a] py-2 text-xs text-white/70"
                >
                  Cancel
                </button>
                <button type="submit" className="btn flex-1 py-2 text-xs font-bold rounded">
                  Send Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARE SAFE MEETING POINT MODAL */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[#3a3a3a] bg-[#222222] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3a3a3a] pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Share Safe Exchange Location</span>
              </h3>
              <button onClick={() => setIsMeetingModalOpen(false)} className="text-white/50 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-white/60 mt-3">
              Select a designated community safe zone equipped with surveillance and public lighting:
            </p>

            <div className="mt-4 space-y-2.5">
              {SAFE_EXCHANGE_PRESETS.map((point) => (
                <button
                  key={point.name}
                  type="button"
                  onClick={() => handleShareMeetingPoint(point)}
                  className="w-full rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] p-3 text-left hover:border-emerald-500/80 hover:bg-[#162319] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{point.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase">Safe Zone</span>
                  </div>
                  <p className="text-[11px] text-white/60 mt-1">{point.address}</p>
                  <p className="text-[10px] text-white/40 italic mt-0.5">{point.notes}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COUNTER OFFER MODAL */}
      {counterModalMessageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-[#3a3a3a] bg-[#222222] p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-white border-b border-[#3a3a3a] pb-2">
              Send Counter Offer
            </h3>
            <form onSubmit={handleCounterSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                  Counter Amount ($)
                </label>
                <input
                  type="number"
                  min={1}
                  value={counterAmountInput}
                  onChange={(e) => setCounterAmountInput(e.target.value)}
                  className="w-full rounded border border-[#3a3a3a] bg-[#1a1a1a] px-3 py-2 font-mono text-sm text-white"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCounterModalMessageId(null)}
                  className="flex-1 rounded border border-[#3a3a3a] py-2 text-xs text-white/70"
                >
                  Cancel
                </button>
                <button type="submit" className="btn flex-1 py-2 text-xs font-bold rounded">
                  Send Counter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
