import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule, DragDropModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  allTasks: Task[] = [];
  todoTasks: Task[] = [];
  inprogressTasks: Task[] = [];
  doneTasks: Task[] = [];

  searchText: string = '';

  showTaskModal = false;
  isEditMode = false;

  taskForm: Task = {
    id: 0,
    title: '',
    description: '',
    status: 'todo'
  };

  ngOnInit() {
    this.updateFilteredTasks();
  }

  updateFilteredTasks() {
    const filtered = this.allTasks.filter(task => this.taskMatchesSearch(task));
    this.todoTasks = filtered.filter(t => t.status === 'todo');
    this.inprogressTasks = filtered.filter(t => t.status === 'inprogress');
    this.doneTasks = filtered.filter(t => t.status === 'done');
  }

  filterTasks() {
    this.updateFilteredTasks();
  }

  taskMatchesSearch(task: Task): boolean {
    if (!this.searchText) return true;
    const text = this.searchText.toLowerCase();
    return task.title.toLowerCase().includes(text) || task.description.toLowerCase().includes(text);
  }

  openAddTaskModal() {
    this.isEditMode = false;
    this.taskForm = { id: 0, title: '', description: '', status: 'todo' };
    this.showTaskModal = true;
  }

  editTask(task: Task) {
    this.isEditMode = true;
    this.taskForm = { ...task };
    this.showTaskModal = true;
  }

  saveTask() {
    if (this.isEditMode) {
      const index = this.allTasks.findIndex(t => t.id === this.taskForm.id);
      this.allTasks[index] = { ...this.taskForm };
    } else {
      this.taskForm.id = Date.now();
      this.allTasks.push({ ...this.taskForm });
    }

    this.filterTasks();
    this.closeModal();
  }

  closeModal() {
    this.showTaskModal = false;
  }

  onDrop(event: CdkDragDrop<Task[]>) {
    const draggedTask = event.item.data;
    const containerId = event.container.element.nativeElement.id;
    const newStatus = this.getStatusFromContainer(containerId);

    // Only process if dropped to a different container
    if (event.previousContainer !== event.container) {
      // Transfer item between arrays
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    // Update task status in allTasks
    const taskIndex = this.allTasks.findIndex(t => t.id === draggedTask.id);
    if (taskIndex !== -1) {
      this.allTasks[taskIndex].status = newStatus;
    }
  }

  private getStatusFromContainer(containerId: string): string {
    if (containerId === 'todo-list') return 'todo';
    if (containerId === 'inprogress-list') return 'inprogress';
    if (containerId === 'done-list') return 'done';
    return 'todo';
  }
}
