package com.medicore.hospital_backend.repository;

import com.medicore.hospital_backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderBySentAtAsc(
            Long senderId,
            Long receiverId,
            Long receiverId2,
            Long senderId2
    );
}