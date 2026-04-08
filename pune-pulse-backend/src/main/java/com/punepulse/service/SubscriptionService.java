package com.punepulse.service;

import com.punepulse.entity.User;
import com.punepulse.entity.UserSubscription;
import com.punepulse.exception.DuplicateResourceException;
import com.punepulse.exception.ResourceNotFoundException;
import com.punepulse.repository.UserRepository;
import com.punepulse.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final UserSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<String> getUserSubscriptions(UUID userId) {
        return subscriptionRepository.findAreaTagsByUserId(userId);
    }

    @Transactional
    public void subscribe(UUID userId, String areaTag) {
        if (subscriptionRepository.existsByUserIdAndAreaTag(userId, areaTag)) {
            throw new DuplicateResourceException("Already subscribed to: " + areaTag);
        }

        User user = userRepository.getReferenceById(userId);
        UserSubscription sub = UserSubscription.builder()
                .user(user)
                .areaTag(areaTag)
                .build();
        subscriptionRepository.save(sub);
    }

    @Transactional
    public void unsubscribe(UUID userId, String areaTag) {
        if (!subscriptionRepository.existsByUserIdAndAreaTag(userId, areaTag)) {
            throw new ResourceNotFoundException("Subscription not found for area: " + areaTag);
        }
        subscriptionRepository.deleteByUserIdAndAreaTag(userId, areaTag);
    }
}
