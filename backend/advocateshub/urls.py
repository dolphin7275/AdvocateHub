from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserDetailAPI, check_auth,

    # Admin-related
    PendingLawyersAPI, ApproveLawyerAPI, RejectLawyerAPI, AllLawyersAPI, AdminRegisterView,

    # Lawyer-related
    UpdateLawyerSlotsAPI, ApprovedLawyersAPIView, ApprovedLawyerListAPI, LawyerDetailAPI,RejectBookingAPI,

    # Booking-related
    CreateBookingAPI, ConfirmBookingAPI, CancelBookingAPI, RescheduleBookingAPI,
    MyBookingsAPI, LawyerBookingsAPI,

    # Notifications
    NotificationAPIView,MarkNotificationsSeenAPI,

    # chat
    ChatHistoryAPI,

   

    # contact 
    ContactQueryView
)


urlpatterns = [
    # ✅ Auth
    path('check-auth/', check_auth),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserDetailAPI.as_view(), name='user_detail'),

    # ✅ Lawyer Slot Management
    path('update-lawyer-slots/', UpdateLawyerSlotsAPI.as_view(), name='update-lawyer-slots'),
    path('reject-booking/<int:booking_id>/', RejectBookingAPI.as_view(), name='reject-booking'),

    path('approved-lawyers/', ApprovedLawyersAPIView.as_view(), name='approved-lawyers'),
    path('lawyer/<int:id>/', LawyerDetailAPI.as_view(), name='lawyer-detail'),

    # ✅ Admin - Lawyer Approval
    path('admin-register/', AdminRegisterView.as_view(), name='admin-register'),
    path('pending-lawyers/', PendingLawyersAPI.as_view(), name='pending-lawyers'),
    path('approve-lawyer/<int:lawyer_id>/', ApproveLawyerAPI.as_view(), name='approve-lawyer'),
    path('reject-lawyer/<int:lawyer_id>/', RejectLawyerAPI.as_view(), name='reject-lawyer'),
    path('all-lawyers/', AllLawyersAPI.as_view(), name='all-lawyers'),

    # ✅ Booking System
    path('book/', CreateBookingAPI.as_view(), name='create-booking'),
    path('bookings/<int:booking_id>/confirm/', ConfirmBookingAPI.as_view(), name='confirm-booking'),
    path('bookings/<int:booking_id>/cancel/', CancelBookingAPI.as_view(), name='cancel-booking'),
    path('bookings/<int:booking_id>/reschedule/', RescheduleBookingAPI.as_view(), name='reschedule-booking'),
    path('my-bookings/', MyBookingsAPI.as_view(), name='my-bookings'),
    path('lawyer-bookings/', LawyerBookingsAPI.as_view(), name='lawyer-bookings'),


    # Notification

    path('notifications/', NotificationAPIView.as_view(), name='get-notifications'),
    path('mark-seen/', MarkNotificationsSeenAPI.as_view(), name='mark-notifications-seen'),

    path('history/<int:booking_id>/', ChatHistoryAPI.as_view(), name='chat-history'),


    #contact
    # path('contact/', ContactQueryView.as_view(), name='contact-query')
    path('contact-queries/', ContactQueryView.as_view(), name='contact-query')


]

# Review Routes
from rest_framework.routers import DefaultRouter
from django.urls import include
from reviews.views import (
    ReviewViewSet, ReviewReplyViewSet,
    LawyerReviewsAPIView, LawyerDetailWithReviewsAPIView
)

router = DefaultRouter()
router.register(r'reviews', ReviewViewSet)
router.register(r'review-replies', ReviewReplyViewSet)

urlpatterns += [
    path('lawyers/<int:lawyer_id>/reviews/', LawyerReviewsAPIView.as_view(), name='lawyer-reviews'),
    path('lawyers/<int:lawyer_id>/', LawyerDetailWithReviewsAPIView.as_view(), name='lawyer-detail-with-reviews'),
    path('', include(router.urls)),
]
