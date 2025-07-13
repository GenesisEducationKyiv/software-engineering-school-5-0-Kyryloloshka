import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from '@lib/common';

@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to weather updates' })
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @ApiCreatedResponse({
    description: 'Subscription successful. Confirmation email sent.',
  })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiConflictResponse({ description: 'Email already subscribed' })
  async subscribe(@Body() dto: CreateSubscriptionDto) {
    return await this.subscriptionService.subscribe(dto);
  }

  @Get('confirm/:token')
  @ApiOperation({ summary: 'Confirm your email address' })
  @ApiParam({ name: 'token', description: 'Token from confirmation email' })
  @ApiOkResponse({ description: 'Subscription confirmed successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid token' })
  @ApiNotFoundResponse({ description: 'Token not found.' })
  async confirm(@Param('token') token: string) {
    return await this.subscriptionService.confirmSubscription({ token });
  }

  @Get('unsubscribe/:token')
  @ApiOperation({
    summary:
      'Unsubscribes an email from weather updates using the token sent in emails.',
  })
  @ApiParam({ name: 'token', description: 'Unsubscribe token' })
  @ApiOkResponse({ description: 'Successfully unsubscribed.' })
  @ApiBadRequestResponse({ description: 'Invalid token' })
  @ApiNotFoundResponse({ description: 'Token not found.' })
  async unsubscribe(@Param('token') token: string) {
    return await this.subscriptionService.unsubscribe({ token });
  }
}
