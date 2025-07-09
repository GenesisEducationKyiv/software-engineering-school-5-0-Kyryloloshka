import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
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
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ISubscriptionService } from './interfaces/subscription-service.interface';

@Controller()
export class SubscriptionController {
  constructor(
    @Inject('ISubscriptionService')
    private readonly subscriptionService: ISubscriptionService,
  ) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to weather updates' })
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @ApiCreatedResponse({
    description: 'Subscription successful. Confirmation email sent.',
  })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiConflictResponse({ description: 'Email already subscribed' })
  async subscribe(@Body() dto: CreateSubscriptionDto) {
    const token = await this.subscriptionService.subscribe(dto);

    return {
      message: 'Subscription successful. Confirmation email sent.',
      token,
    };
  }

  @Get('confirm/:token')
  @ApiOperation({ summary: 'Confirm your email address' })
  @ApiParam({ name: 'token', description: 'Token from confirmation email' })
  @ApiOkResponse({ description: 'Subscription confirmed successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid token' })
  @ApiNotFoundResponse({ description: 'Token not found.' })
  async confirm(@Param('token') token: string) {
    await this.subscriptionService.confirmSubscription(token);

    return { message: 'Subscription confirmed successfully' };
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
    await this.subscriptionService.unsubscribe(token);

    return { message: 'Successfully unsubscribed' };
  }
}
