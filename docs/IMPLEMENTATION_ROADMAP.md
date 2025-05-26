# ContentFlow: Implementation Roadmap

This document provides a detailed implementation plan for the new features requested for ContentFlow. Features are organized by complexity level and include technical specifications, database changes, and implementation steps.

## Feature Overview

The following features have been identified for implementation:

1. **Department Tagging System** (Low Complexity)
2. **Kanban Sorting Feature** (Medium Complexity) 
3. **Rating Feature** (High Complexity)
4. **Post AI Assistant** (High Complexity)

---

## Phase 13: Department Tagging System
**Complexity:** Low | **Priority:** High | **Estimated Time:** 3-5 days

### Overview
Introduce a predefined department tagging system to categorize content items by business unit.

### Technical Requirements
- **Database Changes:** Add `department` field to content_items table
- **UI Components:** Tag selection in content modal, department filter, tag display
- **API Updates:** Validation for department field in CRUD operations

### Implementation Steps

#### 13.1 Database Schema Updates
- [ ] **Update ContentItem Interface** (`src/lib/database.types.ts`)
  ```typescript
  export type Department = 'BSS' | 'Tax Advisory' | 'Management Consulting' | 'Operations' | 'Technology';
  
  export interface ContentItem {
    // ... existing fields
    department?: Department | null;
  }
  ```

- [ ] **Database Migration Script** (`src/scripts/addDepartmentField.sql`)
  ```sql
  -- Add department column to content_items table
  ALTER TABLE content_items ADD COLUMN department TEXT;
  
  -- Add constraint for valid department values
  ALTER TABLE content_items ADD CONSTRAINT content_items_department_check 
    CHECK (department IN ('BSS', 'Tax Advisory', 'Management Consulting', 'Operations', 'Technology'));
  ```

#### 13.2 Backend API Updates
- [ ] **Update API Validation** (`src/app/api/content-items/route.ts`)
  - Add department to validation function
  - Include department in sanitized item creation
  
- [ ] **Update API Types** (`src/app/api/content-items/[id]/route.ts`)
  - Include department field in PUT and GET operations

#### 13.3 Frontend Components
- [ ] **Create DepartmentBadge Component** (`src/components/content/DepartmentBadge.tsx`)
  ```typescript
  interface DepartmentBadgeProps {
    department: Department;
    variant?: 'default' | 'compact';
  }
  ```

- [ ] **Update ContentModal** (`src/components/content/ContentModal.tsx`)
  - Add department selection dropdown
  - Include department in form state management

- [ ] **Update ContentCard** (`src/components/content/ContentCard.tsx`)
  - Display department badge
  - Add department-based color coding

#### 13.4 Filtering and Search
- [ ] **Add Department Filter** (`src/components/board/DepartmentFilter.tsx`)
  - Filter dropdown for status columns
  - Show/hide content based on selected departments

- [ ] **Update ContentBoard** (`src/components/board/ContentBoard.tsx`)
  - Integrate department filtering logic
  - Update state management for filters

### Estimated Completion: End of Week 1

---

## Phase 14: Kanban Sorting Feature
**Complexity:** Medium | **Priority:** High | **Estimated Time:** 5-7 days

### Overview
Add drag-and-drop sorting functionality within columns, allowing cards to reorder based on drop position.

### Technical Requirements
- **Dependencies:** Extend existing @dnd-kit usage
- **Database Changes:** Add `sort_order` field with auto-increment logic
- **UI Enhancements:** Visual feedback for drop zones, sort indicators

### Implementation Steps

#### 14.1 Database Schema Updates
- [ ] **Add Sort Order Field** (`src/scripts/addSortOrderField.sql`)
  ```sql
  -- Add sort_order column for within-column ordering
  ALTER TABLE content_items ADD COLUMN sort_order INTEGER DEFAULT 0;
  
  -- Create index for efficient sorting
  CREATE INDEX idx_content_items_status_sort_order ON content_items(status, sort_order);
  
  -- Update existing items with incremental sort order
  UPDATE content_items SET sort_order = (
    SELECT ROW_NUMBER() OVER (PARTITION BY status ORDER BY created_at)
    FROM content_items c2 WHERE c2.id = content_items.id
  );
  ```

#### 14.2 Backend API Enhancements
- [ ] **Create Sort Order API** (`src/app/api/content-items/reorder/route.ts`)
  ```typescript
  export async function PUT(request: NextRequest) {
    // Handle bulk sort order updates
    // Validate item IDs and new positions
    // Update sort_order values atomically
  }
  ```

- [ ] **Update Query Logic** (`src/app/api/content-items/route.ts`)
  - Order results by sort_order within each status
  - Handle sort_order assignment for new items

#### 14.3 Frontend Sorting Logic
- [ ] **Enhance DnD Implementation** (`src/components/board/ContentBoard.tsx`)
  ```typescript
  const handleDragEnd = (event: DragEndEvent) => {
    // Existing status change logic
    // Add position-based reordering logic
    // Calculate new sort_order values
    // Batch API calls for efficiency
  };
  ```

- [ ] **Add Sort Indicators** (`src/components/content/ContentCard.tsx`)
  - Visual indicators for drag position
  - Hover states for drop zones
  - Animation for smooth reordering

#### 14.4 User Experience Enhancements
- [ ] **Visual Feedback System**
  - Drop zone highlighting
  - Insertion point indicators
  - Smooth animations for reordering

- [ ] **Performance Optimization**
  - Debounced API calls for rapid sorting
  - Optimistic UI updates
  - Error handling and rollback

### Estimated Completion: End of Week 2

---

## Phase 15: Rating Feature  
**Complexity:** High | **Priority:** Medium | **Estimated Time:** 7-10 days

### Overview
Implement a star-based rating system with weekly aggregation and publication scheduling based on ratings.

### Technical Requirements
- **Database Changes:** New `ratings` table, rating aggregation logic
- **New APIs:** Rating CRUD, aggregation endpoints, weekly publication logic
- **UI Components:** Star rating interface, rating displays, publication queue

### Implementation Steps

#### 15.1 Database Design
- [ ] **Create Ratings Table** (`src/scripts/createRatingsTable.sql`)
  ```sql
  CREATE TABLE IF NOT EXISTS content_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    user_identifier TEXT NOT NULL, -- Could be email, user_id, or session_id
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    week_year INTEGER GENERATED ALWAYS AS (EXTRACT(WEEK FROM created_at)) STORED,
    UNIQUE(content_item_id, user_identifier, week_year)
  );
  
  CREATE INDEX idx_content_ratings_week ON content_ratings(week_year, created_at);
  CREATE INDEX idx_content_ratings_content_item ON content_ratings(content_item_id);
  ```

- [ ] **Add Rating Fields to ContentItem** (`src/scripts/addRatingFields.sql`)
  ```sql
  ALTER TABLE content_items ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0;
  ALTER TABLE content_items ADD COLUMN total_ratings INTEGER DEFAULT 0;
  ALTER TABLE content_items ADD COLUMN publication_eligible BOOLEAN DEFAULT FALSE;
  ```

#### 15.2 Rating API Implementation
- [ ] **Create Rating APIs** (`src/app/api/ratings/`)
  - `POST /api/ratings` - Submit new rating
  - `GET /api/ratings/[contentId]` - Get ratings for content
  - `PUT /api/ratings/[id]` - Update existing rating
  - `GET /api/ratings/weekly-summary` - Get weekly aggregation

- [ ] **Rating Business Logic** (`src/lib/ratingService.ts`)
  ```typescript
  export class RatingService {
    static async submitRating(contentId: string, rating: number, userId: string): Promise<void>
    static async calculateWeeklyAverages(): Promise<void>
    static async getPublicationQueue(): Promise<ContentItem[]>
    static async markForPublication(contentId: string): Promise<void>
  }
  ```

#### 15.3 Frontend Rating Components
- [ ] **Star Rating Component** (`src/components/rating/StarRating.tsx`)
  ```typescript
  interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'small' | 'medium' | 'large';
  }
  ```

- [ ] **Rating Display Component** (`src/components/rating/RatingDisplay.tsx`)
  - Show average rating and total count
  - Rating history and trends
  - Weekly publication eligibility status

#### 15.4 Weekly Aggregation System
- [ ] **Automated Rating Aggregation** (`src/app/api/cron/weekly-rating-aggregation/route.ts`)
  - Calculate weekly averages
  - Update publication eligibility
  - Generate publication recommendations

- [ ] **Publication Queue Management**
  - Priority-based content selection
  - Publication scheduling interface
  - Integration with existing post_date field

### Estimated Completion: End of Week 4

---

## Phase 16: Post AI Assistant
**Complexity:** High | **Priority:** Medium | **Estimated Time:** 8-12 days

### Overview
Integrate Google Gemini AI to enhance post creation with intelligent content generation and optimization.

### Technical Requirements
- **New Dependencies:** Google Gemini AI SDK, content generation libraries
- **API Integration:** Secure Gemini API implementation with cost optimization
- **UI Enhancement:** AI assistant modal, content suggestions, optimization features

### Implementation Steps

#### 16.1 AI Service Setup
- [ ] **Install Dependencies** 
  ```bash
  npm install @google/generative-ai ai react-markdown remark-gfm
  ```

- [ ] **Environment Configuration** (`.env.local`)
  ```env
  GOOGLE_GEMINI_API_KEY=your_api_key_here
  GEMINI_MODEL=gemini-1.5-pro
  ```

#### 16.2 AI Service Implementation
- [ ] **Create AI Service** (`src/lib/aiService.ts`)
  ```typescript
  export class AIService {
    static async enhancePostContent(title: string, description: string, platform: Platform[]): Promise<EnhancedContent>
    static async generatePostIdeas(department: Department): Promise<string[]>
    static async optimizeForPlatform(content: string, platform: Platform): Promise<string>
    static async generateHashtags(content: string): Promise<string[]>
  }
  ```

- [ ] **Create AI API Endpoints** (`src/app/api/ai/`)
  - `POST /api/ai/enhance-content` - Content enhancement
  - `POST /api/ai/generate-ideas` - Content idea generation
  - `POST /api/ai/optimize-platform` - Platform-specific optimization

#### 16.3 Cost Optimization Implementation
- [ ] **Request Caching System** (`src/lib/aiCache.ts`)
  ```typescript
  export class AICacheService {
    static async getCachedResponse(prompt: string): Promise<string | null>
    static async cacheResponse(prompt: string, response: string): Promise<void>
    static async clearExpiredCache(): Promise<void>
  }
  ```

- [ ] **Usage Tracking** (`src/lib/aiUsageTracker.ts`)
  - Token usage monitoring
  - Cost calculation and reporting
  - Rate limiting implementation

#### 16.4 AI Assistant UI Components
- [ ] **AI Assistant Modal** (`src/components/ai/AIAssistantModal.tsx`)
  ```typescript
  interface AIAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialContent: Partial<ContentItem>;
    onContentGenerated: (content: Partial<ContentItem>) => void;
  }
  ```

- [ ] **Content Enhancement Panel** (`src/components/ai/ContentEnhancementPanel.tsx`)
  - Real-time content suggestions
  - Platform-specific optimization
  - Hashtag generation
  - Content quality scoring

#### 16.5 Integration with Content Modal
- [ ] **Update ContentModal** (`src/components/content/ContentModal.tsx`)
  - Add AI Assistant button
  - Integrate AI-generated content
  - Show enhancement suggestions

- [ ] **AI Usage Analytics** (`src/components/ai/AIUsageAnalytics.tsx`)
  - Usage tracking dashboard
  - Cost monitoring
  - Performance metrics

### Estimated Completion: End of Week 6

---

## Database Migration Strategy

### Migration Order
1. **Phase 13:** Department field addition
2. **Phase 14:** Sort order field addition  
3. **Phase 15:** Rating system tables creation
4. **Phase 16:** No additional database changes

### Migration Scripts Location
All migration scripts will be stored in `src/scripts/migrations/` with naming convention:
- `20250103_add_department_field.sql`
- `20250110_add_sort_order_field.sql`
- `20250117_create_rating_system.sql`

### Rollback Strategy
Each migration will include corresponding rollback scripts:
- `20250103_add_department_field_rollback.sql`
- etc.

---

## Testing Strategy

### Unit Testing
- API endpoint testing for all new routes
- Component testing for new UI elements
- Service layer testing for business logic

### Integration Testing  
- End-to-end rating workflow
- AI assistant integration testing
- Drag-and-drop sorting validation

### Performance Testing
- AI API response time optimization
- Database query performance with new indexes
- UI responsiveness during drag operations

---

## Security Considerations

### AI Integration Security
- API key management using environment variables
- Input sanitization for AI prompts
- Output validation and content filtering
- Rate limiting to prevent abuse

### Data Privacy
- User rating data anonymization options
- GDPR compliance for rating storage
- Secure AI request logging

---

## Cost Management Strategy

### AI API Optimization
- Response caching to reduce API calls
- Request batching for multiple operations
- Model selection based on complexity (Gemini Pro vs Ultra)
- Usage monitoring and alerting

### Infrastructure Optimization
- Database query optimization with proper indexing
- Efficient state management for real-time features
- Lazy loading for AI components

---

## Success Metrics

### Department Tagging
- Tag adoption rate across content items
- Filter usage analytics
- Content organization improvement

### Kanban Sorting
- User engagement with sorting features
- Workflow efficiency improvements
- Error rates during drag operations

### Rating System
- Rating participation rate
- Publication queue effectiveness
- Content quality improvement metrics

### AI Assistant
- AI feature adoption rate
- Content enhancement acceptance rate
- Cost per AI-generated content piece
- User satisfaction with AI suggestions

---

## Future Enhancement Considerations

### Scalability Preparations
- Microservices architecture readiness
- API rate limiting infrastructure
- Advanced caching strategies

### Advanced Features Pipeline
- Multi-language AI support
- Advanced rating analytics
- Custom department creation
- Advanced sorting algorithms

---

**Last Updated:** January 3, 2025  
**Next Review:** Weekly during implementation phases

## Implementation Notes

- All phases can be developed in parallel by different team members
- Database migrations should be tested in staging environment first
- AI features require careful cost monitoring during development
- User feedback should be collected after each phase completion 