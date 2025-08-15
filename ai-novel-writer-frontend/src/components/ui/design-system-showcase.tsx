'use client'

import * as React from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Badge,
  Progress,
  Skeleton,
  Switch,
  Separator,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Typography,
  ThemeSelector,
  Tooltip,
} from '@/components/ui'

export function DesignSystemShowcase() {
  const [progress, setProgress] = React.useState(65)
  const [switchValue, setSwitchValue] = React.useState(false)

  return (
    <div className="container mx-auto p-8 space-y-12">
      <div className="text-center space-y-4">
        <Typography variant="h1">AI Novel Writer Design System</Typography>
        <Typography variant="lead">
          A comprehensive design system built with Tailwind CSS and Radix UI primitives
        </Typography>
      </div>

      {/* Theme Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Theme System</CardTitle>
          <CardDescription>
            Switch between light, dark, and system themes with automatic preference detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSelector />
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>Semantic typography with consistent spacing and hierarchy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Typography variant="h1">Heading 1</Typography>
          <Typography variant="h2">Heading 2</Typography>
          <Typography variant="h3">Heading 3</Typography>
          <Typography variant="h4">Heading 4</Typography>
          <Typography variant="lead">
            This is a lead paragraph that stands out from regular text.
          </Typography>
          <Typography variant="p">
            This is a regular paragraph with proper line height and spacing for optimal readability.
          </Typography>
          <Typography variant="small">Small text for captions and metadata</Typography>
          <Typography variant="muted">Muted text for secondary information</Typography>
        </CardContent>
      </Card>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Various button styles and sizes for different use cases</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">🎨</Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
          <CardDescription>Input fields, labels, and form controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Type your message here..." />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={switchValue}
              onChange={(e) => setSwitchValue(e.target.checked)}
            />
            <Label htmlFor="notifications">Enable notifications</Label>
          </div>
        </CardContent>
      </Card>

      {/* Badges and Status */}
      <Card>
        <CardHeader>
          <CardTitle>Badges & Status</CardTitle>
          <CardDescription>Status indicators and labels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Progress and Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Progress & Loading</CardTitle>
          <CardDescription>Progress bars and loading states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Writing Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} variant="default" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>AI Processing</span>
              <span>85%</span>
            </div>
            <Progress value={85} variant="success" />
          </div>
          <div className="space-y-2">
            <Typography variant="small">Loading states:</Typography>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avatars */}
      <Card>
        <CardHeader>
          <CardTitle>Avatars</CardTitle>
          <CardDescription>User avatars and profile pictures</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar size="sm">
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
            <Avatar size="default">
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>LG</AvatarFallback>
            </Avatar>
            <Avatar size="xl">
              <AvatarFallback>XL</AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>

      {/* Tooltips */}
      <Card>
        <CardHeader>
          <CardTitle>Tooltips</CardTitle>
          <CardDescription>Contextual help and information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Tooltip content="This is a tooltip on top" side="top">
              <Button variant="outline">Hover me (top)</Button>
            </Tooltip>
            <Tooltip content="This is a tooltip on the right" side="right">
              <Button variant="outline">Hover me (right)</Button>
            </Tooltip>
            <Tooltip content="This is a tooltip on the bottom" side="bottom">
              <Button variant="outline">Hover me (bottom)</Button>
            </Tooltip>
            <Tooltip content="This is a tooltip on the left" side="left">
              <Button variant="outline">Hover me (left)</Button>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      {/* Layout Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Elements</CardTitle>
          <CardDescription>Separators and spacing utilities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Typography variant="p">Content above separator</Typography>
            <Separator className="my-4" />
            <Typography variant="p">Content below separator</Typography>
          </div>
          <div className="flex items-center space-x-4">
            <Typography variant="p">Left content</Typography>
            <Separator orientation="vertical" className="h-6" />
            <Typography variant="p">Right content</Typography>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Demo</CardTitle>
          <CardDescription>Try adjusting the progress value</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProgress(Math.max(0, progress - 10))}
            >
              -10%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProgress(Math.min(100, progress + 10))}
            >
              +10%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProgress(Math.floor(Math.random() * 100))}
            >
              Random
            </Button>
          </div>
          <Progress value={progress} />
          <Typography variant="small">Current value: {progress}%</Typography>
        </CardContent>
      </Card>
    </div>
  )
}