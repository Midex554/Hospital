package com.medicore.hospital_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long senderId;
    private String senderRole;

    private Long receiverId;
    private String receiverRole;

    @Column(length = 3000)
    private String message;

    private String attachmentUrl;

    private LocalDateTime sentAt = LocalDateTime.now();

    public ChatMessage() {
    }

    public Long getId() {
        return id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public String getSenderRole() {
        return senderRole;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public String getReceiverRole() {
        return receiverRole;
    }

    public String getMessage() {
        return message;
    }

    public String getAttachmentUrl() {
        return attachmentUrl;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public void setSenderRole(String senderRole) {
        this.senderRole = senderRole;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public void setReceiverRole(String receiverRole) {
        this.receiverRole = receiverRole;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
}