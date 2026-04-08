package com.punepulse.controller;

import com.punepulse.dto.ApiResponse;
import com.punepulse.dto.ChatRequest;
import com.punepulse.dto.ChatResponse;
import com.punepulse.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponse>> askPune(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = chatService.askPune(request.getQuestion());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
