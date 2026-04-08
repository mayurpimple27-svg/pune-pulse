package com.punepulse.repository;

import com.punepulse.entity.UserSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, UUID> {

    List<UserSubscription> findByUserId(UUID userId);

    @Query("SELECT us.areaTag FROM UserSubscription us WHERE us.user.id = :userId")
    List<String> findAreaTagsByUserId(@Param("userId") UUID userId);

    boolean existsByUserIdAndAreaTag(UUID userId, String areaTag);

    void deleteByUserIdAndAreaTag(UUID userId, String areaTag);
}
