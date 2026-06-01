package com.medicore.hospital_backend.controller;

import com.medicore.hospital_backend.entity.ChatMessage;
import com.medicore.hospital_backend.repository.ChatMessageRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatMessageController {

    private final ChatMessageRepository chatMessageRepository;

    public ChatMessageController(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @PostMapping("/send")
    public ChatMessage sendMessage(@RequestBody ChatMessage chatMessage) {
        return chatMessageRepository.save(chatMessage);
    }

    @GetMapping("/conversation")
    public List<ChatMessage> getConversation(
            @RequestParam Long senderId,
            @RequestParam Long receiverId
    ) {
        return chatMessageRepository
                .findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderBySentAtAsc(
                        senderId,
                        receiverId,
                        receiverId,
                        senderId
                );
    }

    @GetMapping
    public List<ChatMessage> getAllMessages() {
        return chatMessageRepository.findAll();
    }
}